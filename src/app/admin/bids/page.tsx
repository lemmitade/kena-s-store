// ============================================================================
// ADMIN COMPETITIONS PAGE: /admin/bids
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { getCompetitions, getCompetitionResults } from '@/lib/db/repository';
import { CompetitionAdminView } from '@/components/admin/CompetitionAdminView';
import { Sliders } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBidsPage() {
  const competitions = await getCompetitions();
  const results = await getCompetitionResults();

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500">
            Competition Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
            Unique-Lowest-Bid Management
          </h1>
        </div>

        <Link
          href="/admin/bids/settings"
          className="bg-stone-900 text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4" />
          <span>Bidding Preferences &amp; Paid Rules</span>
        </Link>
      </div>

      <CompetitionAdminView competitions={competitions} results={results} />
    </div>
  );
}
