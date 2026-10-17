// ============================================================================
// ADMIN SETTINGS: GODADDY DOMAIN & SSL DIAGNOSTICS
// Real-time DNS inspection, SSL verification, and hosting binding guide
// ============================================================================

import React from 'react';
import { getStoreSettings } from '@/lib/db/repository';
import { DomainDiagnosticsClient } from './DomainDiagnosticsClient';
import { Globe, ShieldCheck, Server, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDomainSettingsPage() {
  const settings = await getStoreSettings();
  const canonicalUrl = process.env.NEXT_PUBLIC_APP_URL || settings.seo_settings?.canonical_url || 'https://kenasstore.com';
  let defaultDomain = 'kenasstore.com';
  try {
    const u = new URL(canonicalUrl.startsWith('http') ? canonicalUrl : `https://${canonicalUrl}`);
    defaultDomain = u.hostname.replace(/^www\./, '');
  } catch {
    defaultDomain = 'kenasstore.com';
  }

  return (
    <div className="max-w-5xl space-y-8 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Infrastructure &amp; Networking
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          GoDaddy Domain &amp; SSL Diagnostics
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-sans">
          Audit live DNS records (A, CNAME, Nameservers), SSL certificate validity, and hosting connection for both root and WWW domains.
        </p>
      </div>

      <DomainDiagnosticsClient initialDomain={defaultDomain} />
    </div>
  );
}
