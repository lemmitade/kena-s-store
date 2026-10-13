// ============================================================================
// ADMIN BIDDING PREFERENCES: /admin/bids/settings
// Configure paid bidding rules, entry fee in ETB, limits and payment gateways
// ============================================================================

import React from 'react';
import { getStoreSettings } from '@/lib/db/repository';
import { BiddingPreferencesForm } from './BiddingPreferencesForm';
import { Trophy, Sliders, DollarSign, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBiddingSettingsPage() {
  const settings = await getStoreSettings();
  const prefs = settings.bidding_preferences || {
    competitions_enabled: true,
    require_payment_to_bid: true,
    default_entry_fee_etb: 100,
    payment_instructions:
      'A participation entry fee of 100 ETB is required per bid. Securely payable via Chapa, Telebirr, or CBE Birr.',
    accepted_payment_methods: ['chapa', 'telebirr', 'cbe_birr'],
    min_bid_limit_etb: 10,
    max_bid_limit_etb: 5000,
    winner_pays_bid_amount: true,
    rules_overview:
      'The winning bid is the lowest amount that is submitted by only ONE participant. All bids are verified deterministically.',
  };

  return (
    <div className="max-w-4xl space-y-8 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Marketing &amp; Competitions
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Unique-Lowest-Bid Preferences
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-sans">
          Configure rules, entry fees (ETB), mandatory payment controls, and minimum/maximum bid constraints.
        </p>
      </div>

      <BiddingPreferencesForm initialPreferences={prefs} />
    </div>
  );
}
