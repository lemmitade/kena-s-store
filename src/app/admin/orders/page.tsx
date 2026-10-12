// ============================================================================
// ADMIN ORDERS PAGE: /admin/orders
// ============================================================================

import React from 'react';
import { getAllOrders } from '@/lib/db/repository';
import { OrdersTable } from '@/components/admin/OrdersTable';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-8 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Fulfillment Pipeline
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Orders &amp; Dispatch ({orders.length})
        </h1>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
