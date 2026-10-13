'use server';

// ============================================================================
// SERVER ACTIONS: BID SUBMISSION WITH PAYMENT & ADMIN PREFERENCES
// ============================================================================

import {
  submitCompetitionBid,
  updateStoreSettings,
  getStoreSettings,
} from '@/lib/db/repository';
import { BiddingPreferences } from '@/types';
import { revalidatePath } from 'next/cache';

export interface BidSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitBidAction(formData: {
  competition_id: string;
  participant_name: string;
  participant_phone: string;
  bid_amount_etb: number;
  payment_method?: string;
  payment_reference?: string;
}): Promise<BidSubmissionResult> {
  try {
    const res = await submitCompetitionBid(formData);
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to submit bid.' };
    }
    return {
      success: true,
      message: `Your bid of ${formData.bid_amount_etb} ETB and entry payment have been securely recorded. Good luck!`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Server error during bid submission: ${(err as Error).message}`,
    };
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
