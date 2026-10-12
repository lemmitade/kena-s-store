'use client';

// ============================================================================
// ADMIN COMPETITION MANAGEMENT VIEW
// Triggers deterministic calculation, reviews histogram, publishes winner
// ============================================================================

import React, { useState } from 'react';
import { Competition, CompetitionResult } from '@/types';
import { formatETB, formatDate } from '@/lib/utils/format';
import {
  calculateCompetitionResultAction,
  publishCompetitionResultAction,
} from '@/app/actions/competitions';
import { Trophy, Calculator, Send, Check, AlertCircle, Shield } from 'lucide-react';

interface CompetitionAdminViewProps {
  competitions: Competition[];
  results: CompetitionResult[];
}

export function CompetitionAdminView({ competitions, results }: CompetitionAdminViewProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCalculate = async (id: string) => {
    setLoading(true);
    setFeedback(null);
    const res = await calculateCompetitionResultAction(id);
    setLoading(false);
    if (res.success) {
      setFeedback(res.summary || 'Deterministic calculation complete. Result ready for review.');
    } else {
      setFeedback(res.error || 'Calculation failed.');
    }
  };

  const handlePublish = async (id: string) => {
    setLoading(true);
    const res = await publishCompetitionResultAction(id);
    setLoading(false);
    if (res.success) {
      setFeedback('Winner officially published to the storefront archive and Telegram alerted!');
    } else {
      setFeedback(res.error || 'Publication failed.');
    }
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {feedback && (
        <div className="p-4 bg-stone-900 text-white flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Legal Guard Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase block">Compliance Safety Guard</span>
          <p className="font-light">
            Paid entry competitions remain locked by default until regulatory compliance in Ethiopia is confirmed by the owner. Promotional zero-fee competitions run with full deterministic mathematical auditing.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {competitions.map((comp) => {
          const matchedResult = results.find((r) => r.competition_id === comp.id);

          return (
            <div key={comp.id} className="bg-white border border-[#E7E5E4] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
                <div>
                  <span className="text-stone-400 uppercase text-[10px] block">
                    Prize: {formatETB(comp.prize_value_etb)}
                  </span>
                  <h2 className="text-xl font-serif font-medium text-stone-900">{comp.title}</h2>
                  <span className="text-stone-500 block pt-0.5">
                    Closes: {formatDate(comp.ends_at)} • Allowed Bids: {comp.min_bid_etb} - {comp.max_bid_etb} ETB
                  </span>
                </div>

                <div>
                  <span className="px-3 py-1 bg-stone-100 text-stone-900 font-bold uppercase text-[11px]">
                    Status: {comp.status}
                  </span>
                </div>
              </div>

              {/* Solved Result Card if exists */}
              {matchedResult ? (
                <div className="p-5 bg-[#FAF9F6] border border-stone-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-stone-900">
                      Calculated Result Snapshot
                    </span>
                    <span className="text-stone-500">
                      Audited: {formatDate(matchedResult.calculated_at)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-3 border border-stone-200">
                      <span className="text-stone-400 block text-[10px] uppercase">
                        Winning Unique Bid
                      </span>
                      <span className="text-lg font-bold text-stone-900">
                        {matchedResult.hasWinner && matchedResult.winning_bid_amount_etb
                          ? formatETB(matchedResult.winning_bid_amount_etb)
                          : 'No Unique Bid'}
                      </span>
                    </div>

                    <div className="bg-white p-3 border border-stone-200">
                      <span className="text-stone-400 block text-[10px] uppercase">Winner Name</span>
                      <span className="text-base font-semibold text-stone-900 truncate block">
                        {matchedResult.hasWinner ? matchedResult.winning_participant_name : 'No Winner'}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        Phone: {matchedResult.winning_participant_phone_masked || '—'}
                      </span>
                    </div>

                    <div className="bg-white p-3 border border-stone-200">
                      <span className="text-stone-400 block text-[10px] uppercase">Publication</span>
                      <span
                        className={`text-sm font-bold uppercase ${
                          matchedResult.is_published ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {matchedResult.is_published ? 'Published (Public)' : 'Pending Admin Approval'}
                      </span>
                    </div>
                  </div>

                  {!matchedResult.is_published && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handlePublish(comp.id)}
                        className="bg-emerald-800 text-white px-5 py-2.5 uppercase tracking-wider font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Authorize &amp; Publish Winner</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center bg-stone-50 p-4 border border-stone-200">
                  <span className="text-stone-600">
                    Bids are currently being accepted. You may trigger the mathematical calculation at any time.
                  </span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleCalculate(comp.id)}
                    className="bg-[#121212] text-white px-5 py-2.5 uppercase tracking-wider font-semibold hover:bg-stone-800 transition-colors flex items-center gap-2"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Run Calculation Solver</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
