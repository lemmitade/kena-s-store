'use server';

// ============================================================================
// SERVER ACTIONS: BID SUBMISSION WITH CHAPA ONLINE PAYMENT & ADMIN PREFERENCES
// ============================================================================

import {
  submitCompetitionBid,
  updateStoreSettings,
  getStoreSettings,
  getCompetitionById,
  getCompetitionEntryByRef,
  markCompetitionEntryPaid,
} from '@/lib/db/repository';
import { initializeChapaPayment, verifyChapaTransaction } from '@/lib/payments/chapa';
import { BiddingPreferences } from '@/types';
import { revalidatePath } from 'next/cache';

export interface BidSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
  checkoutUrl?: string;
  txRef?: string;
}

export async function submitBidAction(formData: {
  competition_id: string;
  participant_name: string;
  participant_phone: string;
  bid_amount_etb: number;
}): Promise<BidSubmissionResult> {
  try {
    const comp = await getCompetitionById(formData.competition_id);
    if (!comp) {
      return { success: false, error: 'Competition not found.' };
    }

    if (comp.status !== 'active') {
      return { success: false, error: 'This competition is not actively accepting bids.' };
    }

    if (new Date().getTime() > new Date(comp.ends_at).getTime()) {
      return { success: false, error: 'This competition has ended.' };
    }

    const settings = await getStoreSettings();
    const isPaidRequired =
      settings.bidding_preferences?.require_payment_to_bid || comp.entry_fee_etb > 0;
    const requiredFee =
      comp.entry_fee_etb > 0
        ? comp.entry_fee_etb
        : settings.bidding_preferences?.default_entry_fee_etb || 100;

    // 1. Paid Entry via Chapa
    if (isPaidRequired && requiredFee > 0) {
      // Reference format: B + 8 digits + 4 digits (<= 20 characters for Chapa v2)
      const txRef = `B${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

      const bidRes = await submitCompetitionBid({
        competition_id: formData.competition_id,
        participant_name: formData.participant_name.trim(),
        participant_phone: formData.participant_phone.trim(),
        bid_amount_etb: Math.round(formData.bid_amount_etb),
        payment_method: 'chapa',
        payment_reference: txRef,
        payment_status: 'pending',
      });

      if (!bidRes.success) {
        return { success: false, error: bidRes.error || 'Failed to register bid.' };
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kenasstore.com';
      const nameParts = formData.participant_name.trim().split(/\s+/);
      const cleanPhone = formData.participant_phone.replace(/\D/g, '');
      const chapaSecret =
        settings.chapa_secret_key ||
        process.env.CHAPA_SECRET_KEY ||
        'CHAPA_LIVE_PRIV_cMgwDMrOciEtxjjs5WU22jbQnqWu8LbXpCYWhzro';

      const chapaRes = await initializeChapaPayment(
        {
          amount: requiredFee,
          currency: 'ETB',
          email: `${cleanPhone}@bids.kenasstore.com`,
          first_name: nameParts[0] || 'Bidder',
          last_name: nameParts.slice(1).join(' ') || 'Participant',
          phone_number: formData.participant_phone.trim(),
          tx_ref: txRef,
          callback_url: `${baseUrl}/api/webhooks/chapa`,
          return_url: `${baseUrl}/bids/${comp.slug}?paid=true&ref=${txRef}`,
          customization: {
            title: 'Bid Entry Fee',
            description: `Entry fee (${requiredFee} ETB) for ${comp.title}`,
          },
        },
        chapaSecret
      );

      if (chapaRes.status === 'success' && chapaRes.data?.checkout_url) {
        return {
          success: true,
          checkoutUrl: chapaRes.data.checkout_url,
          txRef,
        };
      } else {
        return {
          success: false,
          error: `Chapa payment error: ${chapaRes.message || 'Could not connect to payment gateway.'}`,
        };
      }
    }

    // 2. Free Competition Entry
    const res = await submitCompetitionBid({
      competition_id: formData.competition_id,
      participant_name: formData.participant_name.trim(),
      participant_phone: formData.participant_phone.trim(),
      bid_amount_etb: Math.round(formData.bid_amount_etb),
      payment_method: 'free',
      payment_status: 'paid',
    });

    if (!res.success) {
      return { success: false, error: res.error || 'Failed to submit bid.' };
    }

    return {
      success: true,
      message: `Your secret bid of ${formData.bid_amount_etb} ETB has been officially registered. Good luck!`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Server error during bid submission: ${(err as Error).message}`,
    };
  }
}

export async function verifyBidPaymentAction(txRef: string) {
  try {
    const entry = await getCompetitionEntryByRef(txRef);
    if (!entry) {
      return { verified: false, error: 'Entry not found' };
    }

    if (entry.payment_status === 'paid') {
      return { verified: true, entry };
    }

    const settings = await getStoreSettings();
    const chapaSecret =
      settings.chapa_secret_key ||
      process.env.CHAPA_SECRET_KEY ||
      'CHAPA_LIVE_PRIV_cMgwDMrOciEtxjjs5WU22jbQnqWu8LbXpCYWhzro';

    // Verify with Chapa API
    const chapaVerify = await verifyChapaTransaction(txRef, chapaSecret);
    if (chapaVerify.status === 'success' && chapaVerify.data?.status === 'success') {
      const markRes = await markCompetitionEntryPaid(txRef);
      return { verified: true, entry: markRes.entry };
    }

    return { verified: false, status: chapaVerify.data?.status || 'pending' };
  } catch (err) {
    return { verified: false, error: (err as Error).message };
  }
}

export async function updateBiddingPreferencesAction(
  preferences: BiddingPreferences
) {
  try {
    const updated = await updateStoreSettings({
      bidding_preferences: preferences,
      competitions_enabled: preferences.competitions_enabled,
      paid_competitions_unlocked: preferences.require_payment_to_bid,
    });

    revalidatePath('/bids');
    revalidatePath('/bids/[slug]', 'page');
    revalidatePath('/admin/bids');
    revalidatePath('/admin/bids/settings');

    return { success: true, preferences: updated.bidding_preferences };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
