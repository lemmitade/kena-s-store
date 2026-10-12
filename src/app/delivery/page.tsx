// ============================================================================
// DELIVERY & PICKUP PAGE: /delivery
// Configurable delivery zones, fees in ETB, store pickup points & procedures
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections, getDeliveryZones, getPickupLocations } from '@/lib/db/repository';
import { formatETB } from '@/lib/utils/format';
import { Truck, Store, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DeliveryPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();
  const deliveryZones = await getDeliveryZones();
  const pickupLocations = await getPickupLocations();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16">
        <div className="space-y-4 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-stone-500">
            Logistics &amp; Fulfillment
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light">
            Delivery &amp; Store Pickup
          </h1>
          <p className="text-stone-600 text-sm font-light leading-relaxed">
            We provide prompt home delivery across Addis Ababa and regional hubs, alongside complimentary collection at our boutique locations.
          </p>
        </div>

        {/* 1. STORE PICKUP LOCATIONS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
            <Store className="w-5 h-5 text-stone-900" />
            <h2 className="text-lg font-serif font-medium">Boutique Collection Points (Free of Charge)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pickupLocations.map((loc) => (
              <div key={loc.id} className="bg-white border border-[#E7E5E4] p-6 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 block font-serif">{loc.name}</span>
                  <span className="text-emerald-700 font-semibold">0 ETB</span>
                </div>
                <p className="text-stone-600">{loc.address_line}</p>
                <p className="text-stone-400">Hours: {loc.opening_hours}</p>
                <p className="text-stone-500">Phone: {loc.contact_phone}</p>
                {loc.instructions && (
                  <p className="text-stone-500 italic pt-1 border-t border-stone-100">{loc.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 2. DELIVERY ZONES */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
            <Truck className="w-5 h-5 text-stone-900" />
            <h2 className="text-lg font-serif font-medium">Delivery Zones &amp; Transparent Rates</h2>
          </div>

          <div className="bg-white border border-[#E7E5E4] divide-y divide-stone-200">
            {deliveryZones.map((zone) => (
              <div key={zone.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-stone-900 font-serif block">{zone.name}</span>
                  <p className="text-stone-500">{zone.description}</p>
                  <span className="text-stone-400 block pt-0.5">Estimated window: {zone.estimated_delivery_time}</span>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-base font-bold text-stone-900 block">{formatETB(zone.fee_etb)}</span>
                  {zone.free_delivery_threshold_etb && (
                    <span className="text-emerald-700 text-[11px] block">
                      Free delivery on orders over {formatETB(zone.free_delivery_threshold_etb)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
