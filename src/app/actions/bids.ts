'use server';

// ============================================================================
// SERVER ACTION: COMPETITION BID SUBMISSION
// Authoritative server timestamp validation, eligibility & unique constraints
// ============================================================================

import { submitCompetitionBid } from '@/lib/db/repository';

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
}): Promise<BidSubmissionResult> {
  try {
    const res = await submitCompetitionBid(formData);
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to submit bid.' };
    }
    return {
      success: true,
      message: `Your bid of ${formData.bid_amount_etb} ETB has been recorded successfully. Results will be calculated after closing time.`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Server error during bid submission: ${(err as Error).message}`,
    };
  }
}
