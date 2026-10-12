// ============================================================================
// PUBLISHED COMPETITION RESULTS: /bids/results
// Audited results showing winning unique lowest bids, masked winners, and logs
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections, getCompetitionResults, getCompetitions } from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import { Trophy, ShieldCheck, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CompetitionResultsPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();
  const results = await getCompetitionResults();
  const allCompetitions = await getCompetitions();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Editorial Header */}
        <div className="max-w-3xl space-y-4 mb-14">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-stone-500">
            Audit Transparency Log
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal">
            Competition Results Archive
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed">
            All Unique-Lowest-Bid calculations are strictly deterministic and reviewed by administration prior to publication.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="bg-white border border-[#E7E5E4] p-12 text-center max-w-xl mx-auto space-y-4">
            <Trophy className="w-12 h-12 text-stone-300 mx-auto" />
            <h2 className="text-2xl font-serif">No Completed Results Yet</h2>
            <p className="text-xs font-mono text-stone-500">
              Active competitions are currently accepting bids. Results will be posted here immediately upon closing and administrative verification.
            </p>
            <Link
              href="/bids"
              className="inline-block bg-[#121212] text-white px-6 py-3 text-xs font-mono uppercase tracking-widest"
            >
              View Active Competitions
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {results.map((res) => {
              const comp = allCompetitions.find((c) => c.id === res.competition_id);
              return (
                <div
                  key={res.id}
                  className="bg-white border border-[#E7E5E4] p-6 sm:p-10 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                        Audited Result
                      </span>
                      <h2 className="text-2xl font-serif font-medium mt-1">
                        {comp?.title || 'Competition Prize'}
                      </h2>
                      <p className="text-xs font-mono text-stone-500 mt-1">
                        Calculated: {formatDate(res.calculated_at)}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 text-xs font-mono uppercase">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Admin Verified &amp; Published</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
                    <div className="bg-[#FAF9F6] p-5 border border-stone-200 space-y-1">
                      <span className="text-stone-400 block uppercase">Winning Unique Bid</span>
                      <span className="text-xl sm:text-2xl font-bold text-stone-900 block">
                        {res.hasWinner && res.winning_bid_amount_etb
                          ? formatETB(res.winning_bid_amount_etb)
                          : 'No Unique Bid'}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {res.unique_bids_count} unique bid amounts identified
                      </span>
                    </div>

                    <div className="bg-[#FAF9F6] p-5 border border-stone-200 space-y-1">
                      <span className="text-stone-400 block uppercase">Verified Winner</span>
                      <span className="text-base font-semibold text-stone-900 block truncate">
                        {res.hasWinner ? res.winning_participant_name : 'No Winner Determined'}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Phone: {res.winning_participant_phone_masked || '—'}
                      </span>
                    </div>

                    <div className="bg-[#FAF9F6] p-5 border border-stone-200 space-y-1">
                      <span className="text-stone-400 block uppercase">Audited Metrics</span>
                      <span className="text-base font-semibold text-stone-900 block">
                        {res.total_valid_bids_count} Total Valid Bids
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {res.total_entries_count} Participants
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
