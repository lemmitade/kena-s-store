// ============================================================================
// ADMIN POP-UP ADS & ANNOUNCEMENTS: /admin/marketing/pop-ads
// Manage on-entry & on-scroll promo modals, discount vouchers, call-to-actions
// ============================================================================

import React from 'react';
import { getStoreSettings } from '@/lib/db/repository';
import { PopAdsEditorForm } from './PopAdsEditorForm';
import { Megaphone, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPopAdsPage() {
  const settings = await getStoreSettings();
  const popupAd = settings.popup_ad || {
    is_enabled: true,
    headline: 'Welcome to Kena Store',
    description:
      'Enjoy 10% off your first curated Ethiopian sartorial order with complimentary Addis Ababa doorstep delivery.',
    badge_text: 'Limited First Order Privilege',
    promo_code: 'RELAX10',
    image_url:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    button_label: 'Explore Catalog Now',
    button_link: '/shop',
    trigger_delay_seconds: 3,
    trigger_scroll_percent: 25,
  };

  return (
    <div className="max-w-4xl space-y-8 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Growth &amp; Conversions
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Pop-Up Ads &amp; Scroll Announcements
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-sans">
          Configure promotional modal overlays triggered when shoppers visit or scroll through your storefront.
        </p>
      </div>

      <PopAdsEditorForm initialSettings={popupAd} />
    </div>
  );
}
