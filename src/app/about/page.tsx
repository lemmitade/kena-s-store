// ============================================================================
// ABOUT PAGE: /about
// Brand heritage, Ethiopian artisanal weaving, sustainability manifesto
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16">
        <div className="space-y-4 text-center">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-stone-500">
            Artisanal Heritage &amp; Modern Tailoring
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-light leading-tight">
            The Philosophy of {settings.store_name}
          </h1>
        </div>

        <div className="relative aspect-[16/9] w-full bg-stone-200 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85"
            alt="Ethiopian fashion studio craftsmanship"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 font-light leading-relaxed space-y-6 text-base sm:text-lg">
          <p>
            Rooted in Addis Ababa, {settings.store_name} was conceived with a deliberate ambition: to craft enduring modern sartorial garments that honor Ethiopia’s centuries-old textile traditions.
          </p>
          <p>
            We eschew transient trends in favor of structural quietness. Every garment begins with raw natural fibers—organic flax linen harvested for warm highland afternoons, vegetable-tanned calfskin hand-stitched by generational leather artisans, and Shemma cotton handspun and woven on traditional pit looms in Gulele.
          </p>
          <p>
            By marrying minimalist, architectural silhouettes inspired by modern European tailoring with authentic Ethiopian Tibeb geometric motifs, we create a wardrobe that feels effortless both in Addis Ababa and across the globe.
          </p>
        </div>

        <div className="border-t border-[#E7E5E4] pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-stone-400 uppercase">Headquarters</span>
            <p className="font-semibold text-stone-900">Addis Ababa, Ethiopia</p>
            <p className="text-stone-500">Bole Sub-City, Cameroon St</p>
          </div>
          <div className="space-y-1">
            <span className="text-stone-400 uppercase">Craftsmanship</span>
            <p className="font-semibold text-stone-900">100% Handcrafted</p>
            <p className="text-stone-500">Master weavers &amp; leather cordwainers</p>
          </div>
          <div className="space-y-1">
            <span className="text-stone-400 uppercase">Commitment</span>
            <p className="font-semibold text-stone-900">Fair Trade &amp; Ethical</p>
            <p className="text-stone-500">Dignified artisan living wages</p>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
