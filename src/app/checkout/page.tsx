// ============================================================================
// CHECKOUT PAGE: /checkout (SERVER WRAPPER)
// Fetches active delivery zones, pickup locations, and store settings
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { CheckoutForm } from '@/components/storefront/CheckoutForm';
import { getStoreSettings, getPickupLocations, getDeliveryZones } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  const pickupLocations = await getPickupLocations(true);
  const deliveryZones = await getDeliveryZones(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      {/* Checkout Minimalist Header */}
      <header className="border-b border-[#E7E5E4] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="font-serif tracking-widest text-xl font-bold uppercase text-[#121212]">
            {settings.store_name}
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono uppercase text-stone-500">
            <span className="text-stone-900 font-semibold">1. Order Details</span>
            <span>→</span>
            <span>2. Confirmation</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <CheckoutForm
          pickupLocations={pickupLocations}
          deliveryZones={deliveryZones}
          settings={settings}
        />
      </main>
    </div>
  );
}
