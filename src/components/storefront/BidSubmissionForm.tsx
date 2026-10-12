'use client';

// ============================================================================
// INTERACTIVE BID SUBMISSION FORM
// Validates phone number, enforces minimum and maximum bounds in ETB
// ============================================================================

import React, { useState } from 'react';
import { Competition } from '@/types';
import { formatETB } from '@/lib/utils/format';
import { normalizeEthiopianPhone } from '@/lib/utils/phone';
import { submitBidAction } from '@/app/actions/bids';
import { Check, AlertCircle, Lock } from 'lucide-react';

interface BidSubmissionFormProps {
  competition: Competition;
}

export function BidSubmissionForm({ competition }: BidSubmissionFormProps) {
  const [participantName, setParticipantName] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [bidAmount, setBidAmount] = useState<number>(competition.min_bid_etb);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!participantName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const phoneVal = normalizeEthiopianPhone(participantPhone);
    if (!phoneVal.isValid) {
      setErrorMessage(phoneVal.error || 'Please enter a valid Ethiopian phone number.');
      return;
    }

    if (bidAmount < competition.min_bid_etb || bidAmount > competition.max_bid_etb) {
      setErrorMessage(
        `Bid amount must be between ${competition.min_bid_etb} ETB and ${competition.max_bid_etb} ETB.`
      );
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please confirm your acknowledgement of the unique-lowest-bid rules.');
      return;
    }

    setLoading(true);

    try {
      const res = await submitBidAction({
        competition_id: competition.id,
        participant_name: participantName.trim(),
        participant_phone: participantPhone.trim(),
        bid_amount_etb: Math.round(bidAmount),
      });

      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Bid submission failed.');
      } else {
        setSuccessMessage(res.message || 'Bid submitted successfully!');
        setBidAmount(competition.min_bid_etb);
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(`Unexpected error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h3 className="text-base font-serif font-semibold text-stone-900">
          Submit Private Bid
        </h3>
        <p className="text-xs font-mono text-stone-500 mt-1">
          Your bid amount is encrypted and calculated deterministically upon competition closure.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
            Participant Full Name *
          </label>
          <input
            type="text"
            required
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Abebe Kebede"
            className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
            Ethiopian Phone Number *
          </label>
          <input
            type="tel"
            required
            value={participantPhone}
            onChange={(e) => setParticipantPhone(e.target.value)}
            placeholder="09... or 07..."
            className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-stone-900"
          />
          <span className="text-[10px] font-mono text-stone-400">
            Used to contact the verified winner upon audited calculation.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 flex justify-between">
            <span>Your Bid Amount in ETB *</span>
            <span className="text-stone-900 font-semibold font-mono">{formatETB(bidAmount)}</span>
          </label>
          <input
            type="number"
            required
            min={competition.min_bid_etb}
            max={competition.max_bid_etb}
            step={competition.bid_increment_etb || 1}
            value={bidAmount}
            onChange={(e) => setBidAmount(parseFloat(e.target.value) || competition.min_bid_etb)}
            className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-base font-mono focus:outline-none focus:border-stone-900 font-bold"
          />
          <div className="flex justify-between text-[10px] font-mono text-stone-400 pt-0.5">
            <span>Min: {competition.min_bid_etb} ETB</span>
            <span>Max: {competition.max_bid_etb} ETB</span>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-600 pt-2">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-0"
          />
          <span>
            I understand that the winning bid must be the lowest unique amount. If another participant bids the same amount, neither of us wins.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#121212] text-white py-4 text-xs font-mono uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{loading ? 'Submitting Bid...' : `Record Bid (${formatETB(bidAmount)})`}</span>
        </button>

        <div className="text-[11px] font-mono text-center text-stone-400">
          <span>Authoritative server timestamp enforced • Idempotent audit trail</span>
        </div>
      </form>
    </div>
  );
}
