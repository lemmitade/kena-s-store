import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8">
        <h1 className="text-3xl sm:text-5xl font-serif font-light">Terms &amp; Conditions</h1>
        <div className="space-y-6 text-sm text-stone-700 font-light leading-relaxed">
          <p>
            By accessing or ordering from {settings.store_name}, you agree to comply with our store conditions. All prices are listed in Ethiopian Birr (ETB) and include applicable taxes unless explicitly noted.
          </p>
          <h2 className="font-serif text-lg font-medium text-stone-900">Inventory &amp; Pricing Revalidation</h2>
          <p>
            All submitted orders are validated on our secure servers to ensure stock availability and accurate price calculations. In the unlikely event of an pricing or inventory system discrepancy, we reserve the right to contact the customer and rectify or cancel the order prior to dispatch.
          </p>
          <h2 className="font-serif text-lg font-medium text-stone-900">Competition Regulations</h2>
          <p>
            Promotional Unique-Lowest-Bid competitions are governed by published rules. Results are mathematically audited and final. Unpaid or manipulated bid requests are immediately disqualified.
          </p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
