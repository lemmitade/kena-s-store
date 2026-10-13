// ============================================================================
// ADMIN SEO MANAGEMENT: /admin/seo
// Meta tags, OpenGraph previews, canonical URLs, robots indexing
// ============================================================================

import React from 'react';
import { getStoreSettings } from '@/lib/db/repository';
import { SeoManagerForm } from './SeoManagerForm';
import { Search, Globe, Share2, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSeoPage() {
  const settings = await getStoreSettings();
  const seo = settings.seo_settings || {
    meta_title: `${settings.store_name} | ${settings.tagline}`,
    meta_description:
      'Curated Ethiopian luxury fashion, handcrafted highland leather bags, linen garments, and Shemma heritage essentials. Order & relax.',
    keywords:
      'Kena Store, Ethiopian fashion, Habesha clothing, Shemma dress, Addis Ababa shopping, Highland leather, Tibeb',
    og_image_url: settings.logo_url || '/logo.png',
    canonical_url: 'https://kenastore.et',
    twitter_handle: '@kenastore',
    allow_indexing: true,
    google_site_verification: '',
  };

  return (
    <div className="max-w-5xl space-y-8 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Search Engine Optimization
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          SEO &amp; Social Share Management
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-sans">
          Configure how your store appears on Google, Bing, Telegram, Instagram, and Twitter embeds.
        </p>
      </div>

      <SeoManagerForm initialSeo={seo} storeName={settings.store_name} />
    </div>
  );
}
