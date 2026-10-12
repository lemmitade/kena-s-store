import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function ReturnsPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-10">
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-stone-500">
            Client Assurance
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light">Returns &amp; Exchanges Policy</h1>
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 font-light leading-relaxed space-y-6 text-sm sm:text-base">
          <p>
            At {settings.store_name}, every piece is inspected for artisanal excellence before leaving our studio. If an item does not meet your expectations or sizing requirements, we gladly accept returns or size exchanges within <strong>7 calendar days</strong> of physical receipt.
          </p>
          <h3 className="font-serif text-lg font-medium text-stone-900">Eligibility Criteria</h3>
          <ul className="list-disc pl-5 space-y-2 font-mono text-xs text-stone-600">
            <li>Garments must be unworn, unwashed, and in pristine original condition with all fabric tags attached.</li>
            <li>Handcrafted footwear must be tried on carpeted surfaces only to prevent sole scuffing.</li>
            <li>Custom bespoke or monogrammed pieces cannot be returned unless manufacturing flaws are verified.</li>
          </ul>
          <h3 className="font-serif text-lg font-medium text-stone-900">Boutique Exchange Procedure</h3>
          <p>
            You may exchange sizes directly at any of our pickup locations in Addis Ababa without courier delay. Simply present your original order confirmation reference code.
          </p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
