// ============================================================================
// ADMIN SECURITY & LOGIN CREDENTIALS PAGE: /admin/settings/security
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/admin';
import { AdminSecurityForm } from './AdminSecurityForm';
import { Lock, ShieldCheck, Key } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSecurityPage() {
  const settings = await getStoreSettings();
  const session = await getAdminSession();

  return (
    <div className="max-w-3xl space-y-8 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Settings &amp; Access Control
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Admin Login &amp; Security Credentials
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-sans">
          Manage the staff email address and password required to access this dashboard.
        </p>
      </div>

      <div className="bg-stone-50 border border-stone-200 p-4 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <span className="font-semibold text-stone-900 block">Current Active Session:</span>
          <span className="text-stone-600">
            Authenticated as <strong className="text-stone-900">{session.email}</strong>
          </span>
        </div>
      </div>

      <AdminSecurityForm
        initialEmail={settings.admin_credentials?.email || 'admin@kenastore.et'}
      />
    </div>
  );
}
