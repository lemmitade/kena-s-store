// ============================================================================
// UNIQUE-LOWEST-BID ENGINE (DETERMINISTIC, AUDITABLE SOLVER)
// ============================================================================

export interface RawBidSubmission {
  bidId: string;
  entryId: string;
  participantId: string;
  participantName: string;
  participantPhone: string;
  bidAmountETB: number;
  submittedAt: string; // ISO string
  isEligible: boolean; // Verified paid entry or authorized free entry
}

export interface AmountBidGroup {
  amountETB: number;
  count: number;
  isUnique: boolean;
  bids: Array<{
    bidId: string;
    entryId: string;
    participantId: string;
    participantName: string;
  }>;
}

export interface UniqueLowestBidResult {
  hasWinner: boolean;
  totalValidBids: number;
  uniqueBidsCount: number;
  winningBidAmountETB?: number;
  winningBidId?: string;
  winningEntryId?: string;
  winningParticipantName?: string;
  winningParticipantPhoneMasked?: string;
  histogram: AmountBidGroup[];
  calculatedAt: string;
  summaryMessage: string;
}

export function calculateUniqueLowestBid(
  rawBids: RawBidSubmission[],
  closingTimeISO: string,
  minAllowedBidETB = 1,
  maxAllowedBidETB = 1000000,
  bidIncrementETB = 1
): UniqueLowestBidResult {
  const closingTime = new Date(closingTimeISO).getTime();
  const calculatedAt = new Date().toISOString();

  // 1. Filter strictly for valid, eligible bids submitted strictly before or at closing time
  const eligibleBids = rawBids.filter((bid) => {
    if (!bid.isEligible) return false;
    const subTime = new Date(bid.submittedAt).getTime();
    if (isNaN(subTime) || subTime > closingTime) return false;
    if (bid.bidAmountETB < minAllowedBidETB || bid.bidAmountETB > maxAllowedBidETB) return false;
    if (bid.bidAmountETB % bidIncrementETB !== 0) return false;
    return true;
  });

  if (eligibleBids.length === 0) {
    return {
      hasWinner: false,
      totalValidBids: 0,
      uniqueBidsCount: 0,
      histogram: [],
      calculatedAt,
      summaryMessage: 'No eligible bids were submitted before the closing time.',
    };
  }

  // 2. Group bids by amount
  const mapByAmount = new Map<number, AmountBidGroup>();

  for (const bid of eligibleBids) {
    const existing = mapByAmount.get(bid.bidAmountETB);
    const bidInfo = {
      bidId: bid.bidId,
      entryId: bid.entryId,
      participantId: bid.participantId,
      participantName: bid.participantName,
    };

    if (existing) {
      existing.count += 1;
      existing.isUnique = false;
      existing.bids.push(bidInfo);
    } else {
      mapByAmount.set(bid.bidAmountETB, {
        amountETB: bid.bidAmountETB,
        count: 1,
        isUnique: true,
        bids: [bidInfo],
      });
    }
  }

  // 3. Sort histogram ascending by bid amount (deterministic order)
  const sortedHistogram = Array.from(mapByAmount.values()).sort(
    (a, b) => a.amountETB - b.amountETB
  );

  // 4. Find all unique amounts (count === 1)
  const uniqueGroups = sortedHistogram.filter((group) => group.isUnique && group.count === 1);

  if (uniqueGroups.length === 0) {
    return {
      hasWinner: false,
      totalValidBids: eligibleBids.length,
      uniqueBidsCount: 0,
      histogram: sortedHistogram,
      calculatedAt,
      summaryMessage:
        'All submitted bids had multiple matching amounts. Under the published competition rules, no unique bid was determined.',
    };
  }

  // 5. Lowest unique bid is the first item in the sorted unique array
  const winningGroup = uniqueGroups[0];
  const winningBidDetail = winningGroup.bids[0];
  const fullBidRecord = eligibleBids.find((b) => b.bidId === winningBidDetail.bidId)!;

  // Mask phone for privacy in public reporting
  const rawPhone = fullBidRecord.participantPhone;
  const maskedPhone =
    rawPhone.length > 6
      ? `${rawPhone.slice(0, 4)} **** ${rawPhone.slice(-2)}`
      : '***';

  return {
    hasWinner: true,
    totalValidBids: eligibleBids.length,
    uniqueBidsCount: uniqueGroups.length,
    winningBidAmountETB: winningGroup.amountETB,
    winningBidId: winningBidDetail.bidId,
    winningEntryId: winningBidDetail.entryId,
    winningParticipantName: winningBidDetail.participantName,
    winningParticipantPhoneMasked: maskedPhone,
    histogram: sortedHistogram,
    calculatedAt,
    summaryMessage: `Winning unique lowest bid determined at ${winningGroup.amountETB} ETB by ${winningBidDetail.participantName}.`,
  };
}
