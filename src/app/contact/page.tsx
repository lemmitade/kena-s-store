// ============================================================================
// CONTACT PAGE: /contact
// Store contact details, concierge email, boutique location map link
// ============================================================================

import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections } from '@/lib/db/repository';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-14">
        <div className="max-w-xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-stone-500">
            Client Concierge
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light">Contact Our Studio</h1>
          <p className="text-stone-600 text-sm font-light leading-relaxed">
            For bespoke inquiries, order assistance, or atelier appointments, reach out to our team in Addis Ababa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#E7E5E4] p-8 space-y-4">
            <Phone className="w-6 h-6 text-stone-900" />
            <h2 className="font-serif text-lg font-medium">Direct Telephone</h2>
            <p className="text-xs font-mono text-stone-600 leading-relaxed">
              Customer support &amp; pickup inquiries:
            </p>
            <p className="text-sm font-mono font-bold text-stone-900">{settings.contact_phone}</p>
          </div>

          <div className="bg-white border border-[#E7E5E4] p-8 space-y-4">
            <Mail className="w-6 h-6 text-stone-900" />
            <h2 className="font-serif text-lg font-medium">Concierge Email</h2>
            <p className="text-xs font-mono text-stone-600 leading-relaxed">
              Editorial press &amp; bespoke inquiries:
            </p>
            <p className="text-sm font-mono font-bold text-stone-900">{settings.contact_email}</p>
          </div>

          <div className="bg-white border border-[#E7E5E4] p-8 space-y-4">
            <MapPin className="w-6 h-6 text-stone-900" />
            <h2 className="font-serif text-lg font-medium">Addis Ababa Atelier</h2>
            <p className="text-xs font-mono text-stone-600 leading-relaxed">
              {settings.contact_address}
            </p>
            <span className="text-xs font-mono text-stone-500 block pt-1">
              Mon – Sat: 9:00 AM – 8:00 PM
            </span>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
