// ============================================================================
// ADMIN API: /api/admin/domain-check
// Automated DNS, SSL, Nameserver, and GoDaddy Domain Health Audit
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/db/repository';
import dns from 'node:dns/promises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const settings = await getStoreSettings();
    const { searchParams } = new URL(request.url);

    // Extract domain to check
    let targetDomain = searchParams.get('domain');
    if (!targetDomain) {
      const canonical =
        settings.seo_settings?.canonical_url ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://kenastore.et';
      try {
        const u = new URL(canonical.startsWith('http') ? canonical : `https://${canonical}`);
        targetDomain = u.hostname;
      } catch {
        targetDomain = 'kenastore.et';
      }
    }

    // Clean domain
    const cleanDomain = targetDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .trim();
    const apexDomain = cleanDomain.replace(/^www\./, '');
    const wwwDomain = `www.${apexDomain}`;

    // 1. Check A Records (Apex)
    let aRecords: string[] = [];
    let aRecordError: string | null = null;
    try {
      aRecords = await dns.resolve4(apexDomain);
    } catch (err) {
      aRecordError = (err as Error).message;
    }

    // 2. Check CNAME Records (WWW)
    let cnameRecords: string[] = [];
    let cnameRecordError: string | null = null;
    try {
      cnameRecords = await dns.resolveCname(wwwDomain);
    } catch (err) {
      // In some configurations, www has an A record instead of CNAME
      try {
        const wwwA = await dns.resolve4(wwwDomain);
        if (wwwA.length > 0) {
          cnameRecords = [`A: ${wwwA.join(', ')}`];
        } else {
          cnameRecordError = (err as Error).message;
        }
      } catch {
        cnameRecordError = (err as Error).message;
      }
    }

    // 3. Check Nameservers
    let nameservers: string[] = [];
    let nsError: string | null = null;
    try {
      nameservers = await dns.resolveNs(apexDomain);
    } catch (err) {
      nsError = (err as Error).message;
    }

    // 4. Test HTTPS reachability & SSL status
    let apexHttpsOk = false;
    let apexHttpsStatus: number | null = null;
    let apexHttpsError: string | null = null;
    try {
      const res = await fetch(`https://${apexDomain}`, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
      });
      apexHttpsOk = true;
      apexHttpsStatus = res.status;
    } catch (err) {
      apexHttpsError = (err as Error).message;
    }

    let wwwHttpsOk = false;
    let wwwHttpsStatus: number | null = null;
    let wwwHttpsError: string | null = null;
    try {
      const res = await fetch(`https://${wwwDomain}`, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
      });
      wwwHttpsOk = true;
      wwwHttpsStatus = res.status;
    } catch (err) {
      wwwHttpsError = (err as Error).message;
    }

    // Identify GoDaddy nameservers vs Vercel nameservers
    const isUsingGoDaddyNS = nameservers.some((ns) =>
      ns.toLowerCase().includes('domaincontrol.com')
    );
    const isUsingVercelNS = nameservers.some((ns) =>
      ns.toLowerCase().includes('vercel-dns.com')
    );

    // Vercel / Cloudflare detection
    const isVercelIP = aRecords.includes('76.76.21.21');

    const recommendations = isUsingVercelNS
      ? [
          {
            priority: 1,
            title: 'Vercel Nameserver Mode Active ("DNS is managed by Vercel")',
            instruction:
              'Your GoDaddy nameservers are currently pointing to Vercel (ns1.vercel-dns.com / ns2.vercel-dns.com). This is why GoDaddy shows "DNS is managed by Vercel" and disables its internal DNS record editor. All DNS records and SSL certificates are handled directly inside your Vercel Project.',
          },
          {
            priority: 2,
            title: 'Critical: Turn OFF DNSSEC in GoDaddy',
            instruction:
              'The #1 reason domains managed by Vercel randomly stop working or disappear is DNSSEC enabled in GoDaddy. Go to GoDaddy -> Domain Portfolio -> your domain -> DNS -> DNSSEC -> Click "Delete DNSSEC" or Turn OFF. Vercel does not support external GoDaddy DNSSEC keys, which causes internet providers to drop the connection with SERVFAIL.',
          },
          {
            priority: 3,
            title: 'Verify Domain in Vercel Project Dashboard',
            instruction:
              'Go to https://vercel.com/dashboard -> select your kenas-store project -> Settings -> Domains. Verify that both yourdomain.com AND www.yourdomain.com are present with a green "Valid Configuration" status. If there is a "Verify" or "Refresh" button, click it.',
          },
          {
            priority: 4,
            title: 'Ensure Production Branch is Assigned',
            instruction:
              'In Vercel -> Settings -> Git, verify that your production branch is set to "main". Every deployment to main will automatically serve the production domain without dropping connections.',
          },
        ]
      : [
          {
            priority: 1,
            title: 'A Record (@) Apex Configuration',
            instruction:
              'In GoDaddy DNS Management, ensure Type "A", Name "@", Value "76.76.21.21" (for Vercel) or your production server IP is saved with TTL 1 Hour (or 1/2 hour). Delete duplicate or expired parked A records.',
          },
          {
            priority: 2,
            title: 'CNAME Record (www) Configuration',
            instruction:
              'In GoDaddy DNS Management, ensure Type "CNAME", Name "www", Value "cname.vercel-dns.com" (or your apex domain). Do NOT use IP addresses for CNAME.',
          },
          {
            priority: 3,
            title: 'Disable GoDaddy Domain Forwarding',
            instruction:
              'If GoDaddy "Forwarding" is active, it overrides DNS records and breaks SSL/HTTPS certificates with browser security warnings. Always manage domain routing via DNS A/CNAME records, not GoDaddy forwarding.',
          },
          {
            priority: 4,
            title: 'Domain Expiration & Auto-Renew',
            instruction:
              'Check GoDaddy "My Products" to ensure the domain expiration date is in the future, Auto-Renew is ON, and payment method is current.',
          },
          {
            priority: 5,
            title: 'Hosting Provider Custom Domain Binding',
            instruction:
              'In your Vercel/hosting dashboard (Settings -> Domains), ensure BOTH yourdomain.com AND www.yourdomain.com are registered and assigned to Production branch "main". Avoid deploying to preview domains only.',
          },
        ];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      domain: {
        apex: apexDomain,
        www: wwwDomain,
      },
      dns: {
        management_mode: isUsingVercelNS
          ? 'vercel_nameservers'
          : isUsingGoDaddyNS
          ? 'godaddy_nameservers'
          : 'external_nameservers',
        a_records: {
          status: aRecords.length > 0 ? 'configured' : 'missing',
          records: aRecords,
          error: aRecordError,
          expected_for_vercel: '76.76.21.21',
          is_matched: isVercelIP,
        },
        cname_records: {
          status: cnameRecords.length > 0 ? 'configured' : 'missing',
          records: cnameRecords,
          error: cnameRecordError,
          expected_for_vercel: 'cname.vercel-dns.com',
        },
        nameservers: {
          status: nameservers.length > 0 ? 'configured' : 'missing',
          records: nameservers,
          is_godaddy_default: isUsingGoDaddyNS,
          is_vercel_dns: isUsingVercelNS,
          error: nsError,
        },
      },
      ssl_https: {
        apex_accessible: apexHttpsOk,
        apex_status: apexHttpsStatus,
        apex_error: apexHttpsError,
        www_accessible: wwwHttpsOk,
        www_status: wwwHttpsStatus,
        www_error: wwwHttpsError,
      },
      godaddy_recommendations: recommendations,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
