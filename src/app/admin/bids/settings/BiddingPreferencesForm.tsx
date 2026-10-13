'use client';

// ============================================================================
// ADMIN BIDDING PREFERENCES FORM
// ============================================================================

import React, { useState } from 'react';
import { BiddingPreferences } from '@/types';
import { updateBiddingPreferencesAction } from '@/app/actions/bids';
import { Check, AlertCircle, Trophy, DollarSign, ShieldCheck } from 'lucide-react';

interface BiddingPreferencesFormProps {
  initialPreferences: BiddingPreferences;
}

export function BiddingPreferencesForm({
  initialPreferences,
}: BiddingPreferencesFormProps) {
  const [enabled, setEnabled] = useState(initialPreferences.competitions_enabled ?? true);
  const [requirePayment, setRequirePayment] = useState(
    initialPreferences.require_payment_to_bid ?? true
  );
  const [entryFee, setEntryFee] = useState(
    initialPreferences.default_entry_fee_etb ?? 100
  );
  const [minBid, setMinBid] = useState(initialPreferences.min_bid_limit_etb ?? 10);
  const [maxBid, setMaxBid] = useState(initialPreferences.max_bid_limit_etb ?? 5000);
  const [winnerPays, setWinnerPays] = useState(
    initialPreferences.winner_pays_bid_amount ?? true
  );
  const [instructions, setInstructions] = useState(
    initialPreferences.payment_instructions || ''
  );
  const [rules, setRules] = useState(initialPreferences.rules_overview || '');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await updateBiddingPreferencesAction({
        competitions_enabled: enabled,
        require_payment_to_bid: requirePayment,
        default_entry_fee_etb: Number(entryFee) || 0,
        payment_instructions: instructions.trim(),
        accepted_payment_methods: ['chapa', 'telebirr', 'cbe_birr'],
        min_bid_limit_etb: Number(minBid) || 10,
        max_bid_limit_etb: Number(maxBid) || 5000,
        winner_pays_bid_amount: winnerPays,
        rules_overview: rules.trim(),
      });

      setLoading(false);
      if (res.success) {
        setMsg('Bidding preferences and paid competition rules updated successfully!');
      } else {
        setErrorMsg(res.error || 'Failed to update preferences.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(`Server error: ${(err as Error).message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Module Master Switch & Paid Policy */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          <span>1. Competition Module Status &amp; Monetization</span>
        </h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-stone-900 block">
                Enable Unique-Lowest-Bid Competitions Feature
              </span>
              <span className="text-[10px] text-stone-400">
                Displays the competitions tab and entry forms across the storefront.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-stone-100">
            <input
              type="checkbox"
              checked={requirePayment}
              onChange={(e) => setRequirePayment(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-stone-900 block text-rose-900">
                Require Entry Fee Payment to Submit Bids (Paid Competitions)
              </span>
              <span className="text-[10px] text-stone-400">
                When enabled, participants must complete payment before their bids are accepted.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Fee & Bid Limits */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>2. Financials &amp; Bid Value Boundaries (ETB)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Default Entry Fee (ETB) *</label>
            <input
              type="number"
              min={0}
              required
              value={entryFee}
              onChange={(e) => setEntryFee(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-bold font-mono focus:outline-none focus:border-stone-900"
            />
            <span className="text-[10px] text-stone-400">Standard fee charged per entry.</span>
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Minimum Allowed Bid (ETB) *</label>
            <input
              type="number"
              min={1}
              required
              value={minBid}
              onChange={(e) => setMinBid(parseInt(e.target.value, 10) || 10)}
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-mono focus:outline-none focus:border-stone-900"
            />
            <span className="text-[10px] text-stone-400">Floor value participants can select.</span>
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Maximum Allowed Bid (ETB) *</label>
            <input
              type="number"
              min={1}
              required
              value={maxBid}
              onChange={(e) => setMaxBid(parseInt(e.target.value, 10) || 5000)}
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-mono focus:outline-none focus:border-stone-900"
            />
            <span className="text-[10px] text-stone-400">Ceiling value for bid amounts.</span>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={winnerPays}
            onChange={(e) => setWinnerPays(e.target.checked)}
            className="rounded border-stone-300 text-stone-900 focus:ring-0"
          />
          <span className="font-semibold text-stone-900">
            Winner Pays Their Winning Bid Amount Upon Prize Collection
          </span>
        </label>
      </div>

      {/* 3. Instructions & Rules */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
          3. Payment Instructions &amp; Rules Explanation
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Payment Instructions for Users</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Send 100 ETB via Telebirr or CBE Birr..."
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Official Competition Rules Text</label>
            <textarea
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="The winner is the participant who submits the lowest unique amount..."
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-sans leading-relaxed"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#121212] text-white px-8 py-4 uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving Preferences...' : 'Save Bidding Preferences'}
        </button>
      </div>
    </form>
  );
}
