// ============================================================================
// CUSTOMER ORDER HISTORY: /account/orders
// Lists past orders with item snapshots, totals, and tracking links
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections, getAllOrders } from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import { Package, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();
  const orders = await getAllOrders();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full space-y-8">
        <div className="border-b border-stone-200 pb-4">
          <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-2">
            <Link href="/account" className="hover:text-black">
              Account
            </Link>{' '}
            / <span className="text-stone-900 font-semibold">Orders</span>
          </nav>
          <h1 className="text-3xl font-serif font-light">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-[#E7E5E4] p-12 text-center space-y-4 max-w-md mx-auto">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <h2 className="text-xl font-serif">No Orders Yet</h2>
            <p className="text-xs font-mono text-stone-500">
              When you purchase pieces from our collection, your history will be recorded here.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#121212] text-white px-6 py-3 text-xs font-mono uppercase tracking-widest"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6 font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                  <div>
                    <span className="text-stone-400 uppercase text-[11px] block">Reference</span>
                    <span className="font-bold text-sm text-stone-900">{order.order_number}</span>
                    <span className="text-stone-500 block pt-0.5">{formatDate(order.created_at)}</span>
                  </div>

                  <div className="sm:text-right">
                    <span className="inline-block px-2.5 py-1 bg-stone-100 text-stone-900 font-semibold uppercase tracking-wider">
                      {order.order_status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-stone-500 block pt-1">
                      Payment: {order.payment_method.toUpperCase()} ({order.payment_status.toUpperCase()})
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-stone-50">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="text-stone-900 font-medium">{item.product_name}</span>
                        <span className="text-stone-400 block text-[11px]">
                          Qty: {item.quantity} • {item.size || 'STD'} / {item.color || 'STD'}
                        </span>
                      </div>
                      <span className="font-semibold text-stone-900">{formatETB(item.line_total_etb)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-stone-100 gap-4">
                  <div className="space-x-4">
                    <span className="text-stone-500">Total:</span>
                    <span className="font-bold text-sm text-stone-900">{formatETB(order.total_amount_etb)}</span>
                  </div>

                  <Link
                    href={`/order-confirmation/${order.order_number}?token=${order.tracking_token}`}
                    className="inline-flex items-center gap-1.5 text-stone-900 underline font-semibold hover:text-stone-600"
                  >
                    <span>View Receipt &amp; Tracking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
