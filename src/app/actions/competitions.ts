'use server';

// ============================================================================
// SERVER ACTIONS: COMPETITION WINNER CALCULATION & AUDITED PUBLICATION
// ============================================================================

import {
  getCompetitions,
  getCompetitionBids,
  saveCompetitionResult,
  getStoreSettings,
  db,
} from '@/lib/db/repository';
import { calculateUniqueLowestBid } from '@/lib/competitions/engine';
import { sendTelegramMessage, buildWinnerAnnouncementAlert } from '@/lib/telegram/bot';
import { revalidatePath } from 'next/cache';

export async function calculateCompetitionResultAction(competitionId: string) {
  try {
    const comp = db.competitions.find((c) => c.id === competitionId);
    if (!comp) return { success: false, error: 'Competition not found.' };

    const bids = db.competitionBids.filter((b) => b.competition_id === competitionId);

    // Prepare raw submissions for solver
    const submissions = bids.map((b) => ({
      bidId: b.id,
      entryId: b.entry_id,
      participantId: b.entry_id,
      participantName: b.participant_name || 'Participant',
      participantPhone: b.participant_phone_masked || '0911000000',
      bidAmountETB: b.bid_amount_etb,
      submittedAt: b.submitted_at,
      isEligible: b.is_valid,
    }));

    const result = calculateUniqueLowestBid(
      submissions,
      comp.ends_at,
      comp.min_bid_etb,
      comp.max_bid_etb,
      comp.bid_increment_etb
    );

    const savedResult = {
      id: `res-${Date.now()}`,
      competition_id: comp.id,
      total_entries_count: submissions.length,
      total_valid_bids_count: result.totalValidBids,
      unique_bids_count: result.uniqueBidsCount,
      winning_bid_amount_etb: result.winningBidAmountETB,
      winning_bid_id: result.winningBidId,
      winning_entry_id: result.winningEntryId,
      winning_participant_name: result.winningParticipantName,
      winning_participant_phone_masked: result.winningParticipantPhoneMasked,
      has_winner: result.hasWinner,
      hasWinner: result.hasWinner,
      calculated_at: result.calculatedAt,
      is_reviewed_by_admin: true,
      reviewed_at: new Date().toISOString(),
      is_published: false,
    };

    await saveCompetitionResult(savedResult);

    revalidatePath('/admin/bids');
    return { success: true, result: savedResult, summary: result.summaryMessage };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function publishCompetitionResultAction(competitionId: string) {
  try {
    const res = db.competitionResults.find((r) => r.competition_id === competitionId);
    if (!res) return { success: false, error: 'Result must be calculated first.' };

    const comp = db.competitions.find((c) => c.id === competitionId);

    res.is_published = true;
    res.published_at = new Date().toISOString();
    if (comp) comp.status = 'published';

    // Audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      staff_name: 'Super Admin',
      action: 'publish_competition_winner',
      resource_type: 'competitions',
      resource_id: competitionId,
      details: { winningBid: res.winning_bid_amount_etb, winner: res.winning_participant_name },
      created_at: new Date().toISOString(),
    });

    // Send Telegram alert if enabled
    try {
      const settings = await getStoreSettings();
      if (
        settings.telegram_notifications_enabled &&
        settings.telegram_bot_token &&
        settings.telegram_chat_id &&
        res.hasWinner &&
        res.winning_participant_name &&
        res.winning_bid_amount_etb &&
        comp
      ) {
        const msg = buildWinnerAnnouncementAlert(
          comp.title,
          res.winning_participant_name,
          res.winning_bid_amount_etb,
          res.total_entries_count
        );
        await sendTelegramMessage(msg, settings.telegram_bot_token, settings.telegram_chat_id);
      }
    } catch {
      // ignore
    }

    revalidatePath('/bids/results');
    revalidatePath('/admin/bids');
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
