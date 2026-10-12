// ============================================================================
// ADMIN SETTINGS: STORE & BRANDING
// ============================================================================

import React from 'react';
import { getStoreSettings } from '@/lib/db/repository';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminStoreSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Store Branding &amp; Contact Details
        </h1>
      </div>

      <StoreSettingsForm settings={settings} />
    </div>
  );
}
