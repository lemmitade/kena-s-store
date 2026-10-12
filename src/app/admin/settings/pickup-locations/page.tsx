// ============================================================================
// ADMIN SETTINGS: STORE PICKUP LOCATIONS
// ============================================================================

import React from 'react';
import { getPickupLocations } from '@/lib/db/repository';
import { PickupLocationManager } from '@/components/admin/PickupLocationManager';

export const dynamic = 'force-dynamic';

export default async function AdminPickupLocationsPage() {
  const locations = await getPickupLocations(false);

  return (
    <div className="space-y-6 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Click &amp; Collect
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Store Pickup Boutiques
        </h1>
      </div>

      <PickupLocationManager locations={locations} />
    </div>
  );
}
