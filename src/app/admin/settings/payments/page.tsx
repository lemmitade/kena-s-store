// ============================================================================
// ADMIN SETTINGS: PAYMENTS GATEWAY
// ============================================================================

import React from 'react';
import { getStoreSettings } from '@/lib/db/repository';
import { PaymentSettingsForm } from '@/components/admin/PaymentSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Payment Orchestration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Payment Methods &amp; Gateways
        </h1>
      </div>

      <PaymentSettingsForm settings={settings} />
    </div>
  );
}
