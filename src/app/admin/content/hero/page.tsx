// ============================================================================
// ADMIN HERO CAROUSEL & VIDEO EDITOR: /admin/content/hero
// Add/edit carousel slides, image or video media links, call to actions
// ============================================================================

import React from 'react';
import { getStoreSettings } from '@/lib/db/repository';
import { HeroEditorForm } from './HeroEditorForm';
import { Sparkles, Video, Image as ImageIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminHeroContentPage() {
  const settings = await getStoreSettings();
  const slides = settings.hero_slides || [];

  return (
    <div className="max-w-5xl space-y-8 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Storefront Editorial Content
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Hero Section Carousel &amp; Video Media
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-sans">
          Customize the prominent showcase slides on your homepage. Supports high-resolution imagery and direct/YouTube video streaming links.
        </p>
      </div>

      <HeroEditorForm initialSlides={slides} />
    </div>
  );
}
