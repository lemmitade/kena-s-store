// ============================================================================
// COMPETITIONS ENGINE AUTOMATED TESTS
// Verifies deterministic Unique-Lowest-Bid algorithm, tie handling, and late bids
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateUniqueLowestBid, RawBidSubmission } from '../src/lib/competitions/engine';

describe('Unique-Lowest-Bid Competition Engine', () => {
  const closingTime = '2026-10-15T18:00:00.000Z';

  test('Correctly selects unique lowest bid among multiple bids', () => {
    const bids: RawBidSubmission[] = [
      {
        bidId: 'b1',
        entryId: 'e1',
        participantId: 'p1',
        participantName: 'Dawit',
        participantPhone: '0911000001',
        bidAmountETB: 100, // Tied with b2
        submittedAt: '2026-10-14T10:00:00.000Z',
        isEligible: true,
      },
      {
        bidId: 'b2',
        entryId: 'e2',
        participantId: 'p2',
        participantName: 'Sara',
        participantPhone: '0911000002',
        bidAmountETB: 100, // Tied with b1
        submittedAt: '2026-10-14T11:00:00.000Z',
        isEligible: true,
      },
      {
        bidId: 'b3',
        entryId: 'e3',
        participantId: 'p3',
        participantName: 'Almaz',
        participantPhone: '0911000003',
        bidAmountETB: 150, // Unique & lowest eligible!
        submittedAt: '2026-10-14T12:00:00.000Z',
        isEligible: true,
      },
      {
        bidId: 'b4',
        entryId: 'e4',
        participantId: 'p4',
        participantName: 'Yonas',
        participantPhone: '0911000004',
        bidAmountETB: 200, // Tied with b5
        submittedAt: '2026-10-14T13:00:00.000Z',
        isEligible: true,
      },
      {
        bidId: 'b5',
        entryId: 'e5',
        participantId: 'p5',
        participantName: 'Hirut',
        participantPhone: '0911000005',
        bidAmountETB: 200, // Tied with b4
        submittedAt: '2026-10-14T14:00:00.000Z',
        isEligible: true,
      },
    ];

    const result = calculateUniqueLowestBid(bids, closingTime, 1, 5000);

    assert.equal(result.hasWinner, true);
    assert.equal(result.winningBidAmountETB, 150);
    assert.equal(result.winningParticipantName, 'Almaz');
    assert.equal(result.totalValidBids, 5);
    assert.equal(result.uniqueBidsCount, 1);
  });

  test('Handles situation where all submitted amounts are tied (no winner)', () => {
    const bids: RawBidSubmission[] = [
      {
        bidId: 'b1',
        entryId: 'e1',
        participantId: 'p1',
        participantName: 'Dawit',
        participantPhone: '0911000001',
        bidAmountETB: 100,
        submittedAt: '2026-10-14T10:00:00.000Z',
        isEligible: true,
      },
      {
        bidId: 'b2',
        entryId: 'e2',
        participantId: 'p2',
        participantName: 'Sara',
        participantPhone: '0911000002',
        bidAmountETB: 100,
        submittedAt: '2026-10-14T11:00:00.000Z',
        isEligible: true,
      },
      {
        bidId: 'b3',
        entryId: 'e3',
        participantId: 'p3',
        participantName: 'Almaz',
        participantPhone: '0911000003',
        bidAmountETB: 300,
        submittedAt: '2026-10-14T12:00:00.000Z',
        isEligible: true,
      },
      {
        bidId: 'b4',
        entryId: 'e4',
        participantId: 'p4',
        participantName: 'Yonas',
        participantPhone: '0911000004',
        bidAmountETB: 300,
        submittedAt: '2026-10-14T13:00:00.000Z',
        isEligible: true,
      },
    ];

    const result = calculateUniqueLowestBid(bids, closingTime);

    assert.equal(result.hasWinner, false);
    assert.equal(result.uniqueBidsCount, 0);
    assert.equal(result.winningBidAmountETB, undefined);
  });

  test('Strictly excludes bids submitted after closing time', () => {
    const bids: RawBidSubmission[] = [
      {
        bidId: 'b1',
        entryId: 'e1',
        participantId: 'p1',
        participantName: 'Dawit',
        participantPhone: '0911000001',
        bidAmountETB: 50, // Lowest, but late!
        submittedAt: '2026-10-15T18:05:00.000Z', // 5 minutes late
        isEligible: true,
      },
      {
        bidId: 'b2',
        entryId: 'e2',
        participantId: 'p2',
        participantName: 'Sara',
        participantPhone: '0911000002',
        bidAmountETB: 80, // On time & unique
        submittedAt: '2026-10-15T17:59:00.000Z',
        isEligible: true,
      },
    ];

    const result = calculateUniqueLowestBid(bids, closingTime);

    assert.equal(result.hasWinner, true);
    assert.equal(result.winningBidAmountETB, 80);
    assert.equal(result.winningParticipantName, 'Sara');
    assert.equal(result.totalValidBids, 1);
  });

  test('Excludes ineligible or unverified payment bids', () => {
    const bids: RawBidSubmission[] = [
      {
        bidId: 'b1',
        entryId: 'e1',
        participantId: 'p1',
        participantName: 'Unverified',
        participantPhone: '0911000001',
        bidAmountETB: 10,
        submittedAt: '2026-10-14T10:00:00.000Z',
        isEligible: false, // Unverified
      },
      {
        bidId: 'b2',
        entryId: 'e2',
        participantId: 'p2',
        participantName: 'Verified User',
        participantPhone: '0911000002',
        bidAmountETB: 70,
        submittedAt: '2026-10-14T10:00:00.000Z',
        isEligible: true,
      },
    ];

    const result = calculateUniqueLowestBid(bids, closingTime);
    assert.equal(result.hasWinner, true);
    assert.equal(result.winningBidAmountETB, 70);
    assert.equal(result.winningParticipantName, 'Verified User');
  });

  test('Guarantees mathematical idempotency on repeated execution', () => {
    const bids: RawBidSubmission[] = [
      {
        bidId: 'b1',
        entryId: 'e1',
        participantId: 'p1',
        participantName: 'Abebe',
        participantPhone: '0911000001',
        bidAmountETB: 120,
        submittedAt: '2026-10-14T10:00:00.000Z',
        isEligible: true,
      },
    ];

    const r1 = calculateUniqueLowestBid(bids, closingTime);
    const r2 = calculateUniqueLowestBid(bids, closingTime);

    assert.equal(r1.winningBidAmountETB, r2.winningBidAmountETB);
    assert.equal(r1.winningBidId, r2.winningBidId);
    assert.equal(r1.totalValidBids, r2.totalValidBids);
  });
});
