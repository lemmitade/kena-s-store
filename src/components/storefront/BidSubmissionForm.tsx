'use client';

// ============================================================================
// INTERACTIVE BID SUBMISSION FORM WITH CHAPA ONLINE ENTRY PAYMENT
// Validates phone number, enforces minimum/maximum bounds, online Chapa fee
// ============================================================================

import React, { useState } from 'react';
import { Competition } from '@/types';
import { formatETB } from '@/lib/utils/format';
import { normalizeEthiopianPhone } from '@/lib/utils/phone';
import { submitBidAction } from '@/app/actions/bids';
import { Check, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

interface BidSubmissionFormProps {
  competition: Competition;
  entryFee?: number;
}

export function BidSubmissionForm({ competition, entryFee = 100 }: BidSubmissionFormProps) {
  const effectiveFee = competition.entry_fee_etb > 0 ? competition.entry_fee_etb : entryFee;
  const requirePayment = effectiveFee > 0;

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

      if (!res.success) {
        setLoading(false);
        setErrorMessage(res.error || 'Bid submission failed.');
        return;
      }

      // If Chapa checkout URL is returned, redirect to payment gateway
      if (res.checkoutUrl) {
        setSuccessMessage('Redirecting to Chapa secure checkout...');
        window.location.href = res.checkoutUrl;
        return;
      }

      setLoading(false);
      setSuccessMessage(res.message || 'Bid submitted successfully!');
      setBidAmount(competition.min_bid_etb);
    } catch (err) {
      setLoading(false);
      setErrorMessage(`Unexpected error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h3 className="text-base font-serif font-semibold text-stone-900 flex items-center justify-between">
          <span>Submit Private Bid</span>
          {requirePayment && (
            <span className="text-xs font-mono bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded">
              Entry Fee: {formatETB(effectiveFee)}
            </span>
          )}
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

      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        {/* Step 1: Participant Info */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            1. Participant Identification
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="uppercase text-stone-500 block">Full Name *</label>
              <input
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Abebe Kebede"
                className="w-full bg-[#FAF9F6] border border-stone-300 p-3 text-sm focus:outline-none focus:border-stone-900 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="uppercase text-stone-500 block">Mobile Phone (SMS Winner Alerts) *</label>
              <input
                type="tel"
                required
                value={participantPhone}
                onChange={(e) => setParticipantPhone(e.target.value)}
                placeholder="0911 22 33 44"
                className="w-full bg-[#FAF9F6] border border-stone-300 p-3 text-sm focus:outline-none focus:border-stone-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Bid Amount */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            2. Secret Bid Value (ETB)
          </span>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">
              Your Secret Lowest Bid (Between {formatETB(competition.min_bid_etb)} and {formatETB(competition.max_bid_etb)}) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={competition.min_bid_etb}
                max={competition.max_bid_etb}
                value={bidAmount}
                onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#FAF9F6] border border-stone-300 p-3 text-lg font-bold text-stone-900 focus:outline-none focus:border-stone-900"
              />
              <span className="absolute right-4 top-3 text-stone-400 font-bold">ETB</span>
            </div>
            <span className="text-[10px] text-stone-400">
              Only unique bid amounts will be eligible. If two people pick the same amount, both are disqualified.
            </span>
          </div>
        </div>

        {/* Step 3: Online Chapa Payment Step */}
        {requirePayment && (
          <div className="space-y-4 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                3. Entry Fee Payment ({formatETB(effectiveFee)})
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                Chapa Online Payment
              </span>
            </div>

            <div className="bg-stone-50 border-2 border-stone-900 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-stone-900">
                  Instant Payment via Chapa Gateway
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed font-sans">
                Upon clicking the button below, you will be redirected to Chapa to securely complete your <strong>{formatETB(effectiveFee)}</strong> entry fee using <strong>Telebirr</strong>, <strong>CBE Birr</strong>, or <strong>Debit / Credit Cards</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-stone-600">
                <span className="bg-white border border-stone-200 px-2 py-0.5 rounded shadow-sm">Telebirr</span>
                <span className="bg-white border border-stone-200 px-2 py-0.5 rounded shadow-sm">CBE Birr</span>
                <span className="bg-white border border-stone-200 px-2 py-0.5 rounded shadow-sm">Awash Birr</span>
                <span className="bg-white border border-stone-200 px-2 py-0.5 rounded shadow-sm">Visa / Mastercard</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-0"
            />
            <span className="text-[11px] text-stone-600 leading-relaxed font-sans">
              I acknowledge that this bid is binding under the Unique-Lowest-Bid terms. If I am the verified unique winner, I agree to claim the item within 48 hours.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#121212] text-white py-4 px-6 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>
            {loading
              ? 'Connecting to Chapa...'
              : requirePayment
              ? `Pay ${formatETB(effectiveFee)} with Chapa & Submit Bid`
              : 'Submit Official Bid'}
          </span>
        </button>
      </form>
    </div>
  );
}
