import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8">
        <h1 className="text-3xl sm:text-5xl font-serif font-light">Privacy Policy</h1>
        <div className="space-y-6 text-sm text-stone-700 font-light leading-relaxed">
          <p>
            {settings.store_name} is committed to protecting the privacy of your personal data. We collect customer names, phone numbers, and delivery addresses solely to facilitate order fulfillment and customer service.
          </p>
          <h2 className="font-serif text-lg font-medium text-stone-900">Marketing Consent</h2>
          <p>
            Providing your phone number or email at checkout for transactional receipt purposes does not constitute consent for marketing dispatches. We only send promotional communications when you explicitly select the opt-in checkbox.
          </p>
          <h2 className="font-serif text-lg font-medium text-stone-900">Payment Security</h2>
          <p>
            We do not store or process payment card details directly. Online transactions are handled through licensed payment processors (e.g. Chapa) with encrypted TLS connections.
          </p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
