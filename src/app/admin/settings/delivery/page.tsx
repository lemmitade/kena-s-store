// ============================================================================
// ADMIN SETTINGS: DELIVERY ZONES
// ============================================================================

import React from 'react';
import { getDeliveryZones } from '@/lib/db/repository';
import { DeliveryZoneManager } from '@/components/admin/DeliveryZoneManager';

export const dynamic = 'force-dynamic';

export default async function AdminDeliveryPage() {
  const zones = await getDeliveryZones(false);

  return (
    <div className="space-y-6 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Logistics Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Delivery Zones &amp; Rate Rules
        </h1>
      </div>

      <DeliveryZoneManager zones={zones} />
    </div>
  );
}
