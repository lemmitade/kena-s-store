'use client';

// ============================================================================
// CLIENT COMPONENT: DOMAIN & SSL DIAGNOSTICS DASHBOARD
// ============================================================================

import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Server,
  Lock,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface Props {
  initialDomain: string;
}

export function DomainDiagnosticsClient({ initialDomain }: Props) {
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const runDiagnostics = async (domainToCheck?: string) => {
    const target = (domainToCheck || domainInput).trim();
    if (!target) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/domain-check?domain=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Diagnostic inspection failed.');
      } else {
        setResults(data);
      }
    } catch (err) {
      setErrorMsg(`Failed to connect to diagnostics API: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyDnsConfig = () => {
    const configText = `
# GoDaddy DNS Configuration Backup
Domain: ${domainInput}
Date: ${new Date().toISOString()}

Type    Name    Value                 TTL
A       @       76.76.21.21           1 Hour (3600s)
CNAME   www     cname.vercel-dns.com  1 Hour (3600s)

# Nameservers: Ensure GoDaddy Default Nameservers
# Domain Forwarding: MUST BE OFF
`.trim();

    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Diagnostic Test Trigger Bar */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-700" />
            <span>Target Domain Inspection</span>
          </span>
          <span className="text-[10px] text-stone-400 font-normal">
            Real-time DNS resolver &amp; SSL handshake test
          </span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[11px] uppercase text-stone-500 block mb-1">
              Registered Custom Domain (Root or WWW)
            </label>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="yourbrand.com or yourbrand.et"
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 font-mono"
            />
          </div>

          <div className="sm:self-end">
            <button
              type="button"
              onClick={() => runDiagnostics()}
              disabled={loading}
              className="w-full sm:w-auto bg-[#121212] text-white px-6 py-3.5 text-xs font-mono uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{loading ? 'Auditing DNS & SSL...' : 'Run Live Diagnostic'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Live Diagnostic Results Card */}
      {results && (
        <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
                Audit Results for {results.domain.apex}
              </h2>
              <span className="text-[10px] text-stone-400">
                Tested on {new Date(results.timestamp).toLocaleString()}
              </span>
            </div>
            <button
              onClick={copyDnsConfig}
              className="text-stone-600 hover:text-black border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-1 text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied DNS Spec!' : 'Copy DNS Records'}</span>
            </button>
          </div>

          {/* Status Indicator Banner */}
          {results.dns.management_mode === 'vercel_nameservers' ? (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold font-mono uppercase text-blue-950">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>DNS is Managed by Vercel (Nameserver Delegation Active)</span>
              </div>
              <p className="leading-relaxed font-sans text-stone-700">
                Your GoDaddy domain nameservers are pointing to Vercel (<code>ns1.vercel-dns.com</code> / <code>ns2.vercel-dns.com</code>). In this mode, GoDaddy disables its local DNS editor by design. All records, SSL certificates, and routing are managed in your Vercel Dashboard. <strong>Ensure DNSSEC is OFF in GoDaddy</strong> to prevent random drops.
              </p>
            </div>
          ) : results.dns.nameservers.is_godaddy_default ? (
            <div className="p-4 bg-stone-50 border border-stone-200 text-stone-800 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold font-mono uppercase text-stone-900">
                <Server className="w-4 h-4 text-stone-700" />
                <span>GoDaddy Standard DNS Mode Active</span>
              </div>
              <p className="leading-relaxed font-sans text-stone-600">
                Your domain is using GoDaddy default nameservers. Ensure A record <code>@</code> points to <code>76.76.21.21</code> and CNAME <code>www</code> points to <code>cname.vercel-dns.com</code>.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A Record */}
            <div className="border border-stone-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-stone-500 font-semibold flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>A Record (@) Apex</span>
                </span>
                {results.dns.a_records.status === 'configured' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolving</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missing / Expired</span>
                  </span>
                )}
              </div>
              <div className="text-xs font-mono bg-stone-50 p-2.5 border border-stone-100">
                {results.dns.a_records.records?.length > 0 ? (
                  results.dns.a_records.records.map((ip: string) => (
                    <div key={ip} className="text-stone-900">
                      IP: <span className="font-bold">{ip}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-rose-600">
                    No active IPv4 address found. ({results.dns.a_records.error})
                  </div>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                Target hosting IP for Vercel is <code className="text-stone-800 font-bold">76.76.21.21</code>.
              </p>
            </div>

            {/* CNAME Record */}
            <div className="border border-stone-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-stone-500 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>CNAME Record (www)</span>
                </span>
                {results.dns.cname_records.status === 'configured' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolving</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Missing</span>
                  </span>
                )}
              </div>
              <div className="text-xs font-mono bg-stone-50 p-2.5 border border-stone-100">
                {results.dns.cname_records.records?.length > 0 ? (
                  results.dns.cname_records.records.map((c: string) => (
                    <div key={c} className="text-stone-900">
                      Points to: <span className="font-bold">{c}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-stone-500">
                    Not resolved. Value should be{' '}
                    <code className="text-stone-800 font-bold">cname.vercel-dns.com</code>.
                  </div>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                Ensures <code className="text-stone-800">www.{results.domain.apex}</code> redirects seamlessly.
              </p>
            </div>

            {/* SSL / HTTPS Status */}
            <div className="border border-stone-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-stone-500 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>HTTPS / SSL Certificate</span>
                </span>
                {results.ssl_https.apex_accessible ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valid SSL</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Incomplete Handshake</span>
                  </span>
                )}
              </div>
              <div className="text-xs font-mono bg-stone-50 p-2.5 border border-stone-100 space-y-1">
                <div>
                  Root HTTPS: {results.ssl_https.apex_accessible ? 'HTTP 200/308 OK' : 'Unavailable'}{' '}
                  {results.ssl_https.apex_error && (
                    <span className="text-rose-600">({results.ssl_https.apex_error})</span>
                  )}
                </div>
                <div>
                  WWW HTTPS: {results.ssl_https.www_accessible ? 'HTTP 200/308 OK' : 'Unavailable'}{' '}
                  {results.ssl_https.www_error && (
                    <span className="text-rose-600">({results.ssl_https.www_error})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Nameservers */}
            <div className="border border-stone-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-stone-500 font-semibold flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>Nameservers</span>
                </span>
                <span className="text-[11px] text-stone-700 font-bold">
                  {results.dns.nameservers.is_godaddy_default
                    ? 'GoDaddy Default'
                    : 'Custom NS'}
                </span>
              </div>
              <div className="text-xs font-mono bg-stone-50 p-2.5 border border-stone-100">
                {results.dns.nameservers.records?.length > 0 ? (
                  results.dns.nameservers.records.map((ns: string) => (
                    <div key={ns} className="text-stone-700">
                      {ns}
                    </div>
                  ))
                ) : (
                  <div className="text-stone-500">No NS detected.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Authoritative GoDaddy Setup Guide Table */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
            Authoritative GoDaddy DNS Configuration Guide
          </h2>
          <p className="text-xs text-stone-500 mt-2 font-sans">
            To prevent your domain from disappearing or intermittently returning DNS / SSL errors, configure the following records inside your GoDaddy DNS Management Console:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Type</th>
                <th className="pb-3 font-normal">Name / Host</th>
                <th className="pb-3 font-normal">Value / Points To</th>
                <th className="pb-3 font-normal">TTL</th>
                <th className="pb-3 font-normal">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr className="hover:bg-stone-50">
                <td className="py-3 font-bold text-stone-900">A</td>
                <td className="py-3 font-bold text-stone-900">@</td>
                <td className="py-3 text-emerald-800 font-bold">76.76.21.21</td>
                <td className="py-3 text-stone-600">1 Hour (3600s)</td>
                <td className="py-3 text-stone-500 font-sans text-[11px]">
                  Points root apex domain to production hosting
                </td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="py-3 font-bold text-stone-900">CNAME</td>
                <td className="py-3 font-bold text-stone-900">www</td>
                <td className="py-3 text-emerald-800 font-bold">cname.vercel-dns.com</td>
                <td className="py-3 text-stone-600">1 Hour (3600s)</td>
                <td className="py-3 text-stone-500 font-sans text-[11px]">
                  Aliases www subdomain to hosting router
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Critical GoDaddy Gotchas & Warnings */}
        <div className="space-y-4 pt-4 border-t border-stone-100 text-xs font-sans">
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-xs font-mono uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Critical: Disable GoDaddy Domain Forwarding</span>
            </h4>
            <p className="text-[12px] leading-relaxed">
              If GoDaddy &quot;Forwarding&quot; is enabled on your domain, GoDaddy replaces the A record with an HTTP redirect proxy (typically <code className="font-mono bg-white px-1">34.102.136.180</code>). This breaks HTTPS and causes certificates to fail or disconnect. <strong>Delete any Forwarding rules in GoDaddy</strong> and rely on DNS A/CNAME records.
            </p>
          </div>

          <div className="p-4 bg-stone-100 border border-stone-200 text-stone-800 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-xs font-mono uppercase text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-stone-700 flex-shrink-0" />
              <span>Hosting Provider Persistence (Vercel / Cloud)</span>
            </h4>
            <p className="text-[12px] leading-relaxed">
              In your hosting control panel, ensure that your custom domain is bound to the <strong>Production</strong> environment (<code className="font-mono bg-white px-1">main</code> branch), not a temporary deployment preview URL. Every new deployment will automatically retain the custom domain without downtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
