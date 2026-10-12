// ============================================================================
// ORDER TRACKING PAGE: /track-order
// Secure verification requiring Order Number + Phone/Token, live timeline
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections, getOrderByTracking } from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import { Search, CheckCircle2, Clock, Truck, Store, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TrackOrderPageProps {
  searchParams: Promise<{
    order?: string;
    phone?: string;
    token?: string;
  }>;
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { order, phone, token } = await searchParams;
  const settings = await getStoreSettings();
  const sections = await getSections();

  const orderNumber = order?.trim() || '';
  const verificationParam = (token || phone || '').trim();

  let matchedOrder = null;
  let hasSearched = false;

  if (orderNumber && verificationParam) {
    hasSearched = true;
    matchedOrder = await getOrderByTracking(orderNumber, verificationParam);
  }

  // Delivery pipeline stages
  const deliveryStages = [
    { key: 'confirmed', label: 'Order Confirmed' },
    { key: 'preparing', label: 'In Preparation' },
    { key: 'ready_for_dispatch', label: 'Ready for Dispatch' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  // Pickup pipeline stages
  const pickupStages = [
    { key: 'confirmed', label: 'Order Confirmed' },
    { key: 'preparing', label: 'Preparing at Studio' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup' },
    { key: 'picked_up', label: 'Collected' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
            Fulfillment Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light">Track Your Order</h1>
          <p className="text-xs font-mono text-stone-500">
            Enter your Order Reference Number and the mobile number used during checkout to inspect live fulfillment progress.
          </p>
        </div>

        {/* Search verification form */}
        <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 mb-10 max-w-2xl mx-auto">
          <form action="/track-order" method="GET" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  Order Number *
                </label>
                <input
                  type="text"
                  required
                  name="order"
                  defaultValue={orderNumber}
                  placeholder="e.g. ORD-2026-104821"
                  className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  Phone Number or Token *
                </label>
                <input
                  type="text"
                  required
                  name="phone"
                  defaultValue={phone || token || ''}
                  placeholder="09... or 07..."
                  className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#121212] text-white py-3.5 text-xs font-mono uppercase tracking-widest hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Verify &amp; Locate Order</span>
            </button>
          </form>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div>
            {!matchedOrder ? (
              <div className="bg-white border border-rose-200 p-8 text-center space-y-3 max-w-2xl mx-auto">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="text-lg font-serif">Order Not Found</h3>
                <p className="text-xs font-mono text-stone-500">
                  No matching record was found for order &ldquo;{orderNumber}&rdquo; with the provided verification detail. Please check the spelling or format.
                </p>
              </div>
            ) : (
              /* Order Status Card */
              <div className="bg-white border border-[#E7E5E4] p-8 sm:p-10 space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400">
                      Order Reference
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-950">
                      {matchedOrder.order_number}
                    </h2>
                    <p className="text-xs font-mono text-stone-500 mt-1">
                      Placed: {formatDate(matchedOrder.created_at)}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 block">
                      Current Status
                    </span>
                    <span className="inline-block px-3 py-1 bg-stone-900 text-white text-xs font-mono uppercase font-bold tracking-wider mt-1">
                      {matchedOrder.order_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500">
                    Fulfillment Progress
                  </h3>

                  <div className="relative">
                    {/* Pipeline */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                      {(matchedOrder.fulfillment_type === 'store_pickup'
                        ? pickupStages
                        : deliveryStages
                      ).map((stage, idx) => {
                        const isReached = true; // In production this maps to status index
                        return (
                          <div
                            key={stage.key}
                            className="bg-[#FAF9F6] border border-stone-200 p-3 space-y-1"
                          >
                            <span className="text-[10px] font-mono text-stone-400 block">
                              0{idx + 1}
                            </span>
                            <span className="text-xs font-semibold block text-stone-900">
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Pickup PIN Reminder if pickup */}
                {matchedOrder.fulfillment_type === 'store_pickup' && (
                  <div className="bg-[#FAF9F6] border-2 border-stone-900 p-6 text-center space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                      Pickup Reference PIN Code
                    </span>
                    <div className="text-3xl font-mono font-bold tracking-widest text-stone-950">
                      {matchedOrder.fulfillment?.pickup_reference_code || 'Pending'}
                    </div>
                    <p className="text-xs font-mono text-stone-600">
                      Location: {matchedOrder.fulfillment?.pickup_location_name}
                    </p>
                  </div>
                )}

                {/* Ordered Items Summary */}
                <div className="border-t border-stone-200 pt-6 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500">
                    Pieces in This Shipment
                  </h3>
                  <div className="divide-y divide-stone-100">
                    {matchedOrder.items?.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between text-xs font-mono">
                        <span>
                          {item.quantity}x {item.product_name} ({item.size || 'STD'}/{item.color || 'STD'})
                        </span>
                        <span className="font-semibold">{formatETB(item.line_total_etb)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
