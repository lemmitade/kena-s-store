// ============================================================================
// ADMIN COMPETITIONS PAGE: /admin/bids
// ============================================================================

import React from 'react';
import { getCompetitions, getCompetitionResults } from '@/lib/db/repository';
import { CompetitionAdminView } from '@/components/admin/CompetitionAdminView';

export const dynamic = 'force-dynamic';

export default async function AdminBidsPage() {
  const competitions = await getCompetitions();
  const results = await getCompetitionResults();

  return (
    <div className="space-y-6 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Competition Architecture
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Unique-Lowest-Bid Management
        </h1>
      </div>

      <CompetitionAdminView competitions={competitions} results={results} />
    </div>
  );
}
