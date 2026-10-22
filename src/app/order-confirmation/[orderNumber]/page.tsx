// ============================================================================
// ORDER CONFIRMATION PAGE: /order-confirmation/[orderNumber]
// Secure order receipt, immutable fulfillment snapshots, pickup PIN display
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByNumber, getStoreSettings } from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import { CheckCircle2, MapPin, Store, Truck, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface OrderConfirmationPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const { token } = await searchParams;
  const settings = await getStoreSettings();
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  // Security check: verify tracking token if provided for guest security
  const isAuthorized = !token || order.tracking_token === token;
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F6]">
        <div className="max-w-md bg-white border border-stone-200 p-8 text-center space-y-4">
          <h1 className="text-xl font-serif">Security Verification Required</h1>
          <p className="text-xs font-mono text-stone-500">
            For customer privacy, order receipts require a valid access token. Please check your order confirmation link or track using your phone number.
          </p>
          <Link
            href="/track-order"
            className="inline-block bg-stone-900 text-white px-6 py-3 text-xs font-mono uppercase tracking-wider"
          >
            Track Order With Phone Number
          </Link>
        </div>
      </div>
    );
  }

  const isPickup = order.fulfillment_type === 'store_pickup';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header branding */}
        <div className="text-center">
          <Link href="/" className="font-serif tracking-widest text-2xl font-bold uppercase text-[#121212]">
            {settings.store_name}
          </Link>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white border border-[#E7E5E4] p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-3 border-b border-stone-200 pb-8">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal">Order Confirmed</h1>
            <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
              Order Reference: <strong className="text-stone-900">{order.order_number}</strong>
            </p>
            <p className="text-xs text-stone-500 font-mono">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          {/* Special Pickup PIN Card if store pickup */}
          {isPickup && order.fulfillment?.pickup_reference_code && (
            <div className="bg-[#FAF9F6] border-2 border-stone-900 p-6 text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 block">
                Your In-Store Pickup Collection PIN
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-stone-950 py-1">
                {order.fulfillment.pickup_reference_code}
              </div>
              <p className="text-xs font-mono text-stone-600">
                Present this code to store staff at <strong>{order.fulfillment.pickup_location_name}</strong> upon collection.
              </p>
            </div>
          )}

          {/* Bank Transfer Instructions Card */}
          {order.payment_method === 'bank_transfer' && (
            <div className="bg-[#FAF9F6] border-2 border-stone-900 p-6 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-900 font-bold uppercase tracking-wider text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>Direct Bank Transfer / Telebirr Details</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded uppercase">
                  Awaiting Transfer Verification
                </span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Please transfer the total order amount of <strong className="text-stone-900 font-bold">{formatETB(order.total_amount_etb)}</strong> to either account below using your Order Number (<strong>{order.order_number}</strong>) as the transaction reason/reference:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white border border-stone-200 p-3.5 rounded space-y-1">
                  <span className="text-[10px] uppercase text-stone-400 block font-semibold">
                    {settings.bank_name || 'Commercial Bank of Ethiopia (CBE)'}
                  </span>
                  <p className="font-bold text-stone-900 text-sm tracking-wider">
                    {settings.bank_account_number || '1000234567891'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Account Name: <strong>{settings.bank_account_name || settings.store_name}</strong>
                  </p>
                </div>
                <div className="bg-white border border-stone-200 p-3.5 rounded space-y-1">
                  <span className="text-[10px] uppercase text-stone-400 block font-semibold">
                    Telebirr Direct
                  </span>
                  <p className="font-bold text-stone-900 text-sm tracking-wider">
                    {settings.telebirr_account_number || settings.contact_phone || '0911234567'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Account Name: <strong>{settings.telebirr_account_name || settings.store_name}</strong>
                  </p>
                </div>
              </div>
              {order.notes && (
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  Recorded reference: <strong className="text-stone-900">{order.notes}</strong>
                </div>
              )}
            </div>
          )}

          {/* Fulfillment details snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono border-b border-stone-200 pb-8">
            <div className="space-y-1.5">
              <span className="text-stone-400 uppercase tracking-wider block">Fulfillment</span>
              <div className="flex items-center gap-2 font-semibold text-stone-900">
                {isPickup ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                <span>{isPickup ? 'Store Pickup' : 'Home Delivery'}</span>
              </div>
              {isPickup ? (
                <p className="text-stone-600 font-light">{order.fulfillment?.pickup_location_name}</p>
              ) : (
                <div className="text-stone-600 font-light space-y-0.5">
                  <p>{order.fulfillment?.delivery_zone_name} ({order.fulfillment?.delivery_sub_city} Sub-City)</p>
                  <p>{order.fulfillment?.delivery_address}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-stone-400 uppercase tracking-wider block">Customer &amp; Payment</span>
              <p className="font-semibold text-stone-900">{order.customer_name}</p>
              <p className="text-stone-600">{order.customer_phone}</p>
              <p className="text-stone-500 pt-1">
                Payment: <strong className="uppercase">{order.payment_method.replace(/_/g, ' ')}</strong> ({order.payment_status.toUpperCase()})
              </p>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-4 border-b border-stone-200 pb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-stone-400">
              Ordered Pieces ({order.items?.length || 0})
            </h2>
            <div className="divide-y divide-stone-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-stone-900">{item.product_name}</p>
                    <p className="font-mono text-stone-400">
                      {item.size ? `Size: ${item.size} • ` : ''}
                      {item.color ? `Color: ${item.color} • ` : ''}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-stone-900">
                    {formatETB(item.line_total_etb)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatETB(order.subtotal_etb)}</span>
            </div>
            {order.discount_amount_etb > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.applied_coupon_code})</span>
                <span>-{formatETB(order.discount_amount_etb)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Fulfillment Fee</span>
              <span>{order.delivery_fee_etb === 0 ? 'FREE' : formatETB(order.delivery_fee_etb)}</span>
            </div>
            <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-bold text-stone-900">
              <span>Total Paid / Payable</span>
              <span>{formatETB(order.total_amount_etb)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between">
            <Link
              href={`/track-order?order=${order.order_number}&token=${order.tracking_token}`}
              className="bg-[#121212] text-white px-6 py-3.5 text-xs font-mono uppercase tracking-wider text-center hover:bg-stone-800 transition-colors"
            >
              Live Order Status Tracking
            </Link>
            <Link
              href="/shop"
              className="border border-stone-300 text-stone-800 px-6 py-3.5 text-xs font-mono uppercase tracking-wider text-center hover:bg-stone-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="text-center text-xs font-mono text-stone-400">
          <p>Questions regarding your order? Reach our Addis Ababa concierge at {settings.contact_phone}</p>
        </div>
      </div>
    </div>
  );
}
