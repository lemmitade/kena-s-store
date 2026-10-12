// ============================================================================
// ADMIN DASHBOARD OVERVIEW: /admin/dashboard
// Real-time metrics: Revenue in ETB, orders, low-stock warnings, fulfillment mix
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  getAllOrders,
  getProducts,
  getAllCustomers,
  getAllCoupons,
  getCompetitions,
} from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Users,
  Trophy,
  Truck,
  Store,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const orders = await getAllOrders();
  const products = await getProducts({ includeDrafts: true });
  const customers = await getAllCustomers();
  const coupons = await getAllCoupons();
  const competitions = await getCompetitions();

  // Metrics computation from real database state
  const totalRevenueETB = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount_etb, 0);

  const pendingOrders = orders.filter(
    (o) => o.order_status !== 'delivered' && o.order_status !== 'picked_up' && o.order_status !== 'cancelled'
  );

  const lowStockVariants = products.flatMap((p) =>
    (p.variants || [])
      .filter((v) => v.stock_quantity <= p.low_stock_threshold)
      .map((v) => ({ product: p, variant: v }))
  );

  const deliveryOrdersCount = orders.filter((o) => o.fulfillment_type === 'home_delivery').length;
  const pickupOrdersCount = orders.filter((o) => o.fulfillment_type === 'store_pickup').length;
  const activeCompetitions = competitions.filter((c) => c.status === 'active');

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
          Executive Summary
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium mt-1">Platform Analytics</h1>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        <div className="bg-white border border-[#E7E5E4] p-6 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs uppercase tracking-wider">Paid Revenue</span>
            <span className="text-stone-900 font-bold">ETB</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">{formatETB(totalRevenueETB)}</div>
          <span className="text-[11px] text-stone-500 block">From verified paid orders</span>
        </div>

        <div className="bg-white border border-[#E7E5E4] p-6 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs uppercase tracking-wider">Orders</span>
            <ShoppingBag className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{orders.length} Total</div>
          <span className="text-[11px] text-amber-700 font-semibold block">
            {pendingOrders.length} currently pending fulfillment
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E4] p-6 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs uppercase tracking-wider">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{lowStockVariants.length} SKUs</div>
          <span className="text-[11px] text-stone-500 block">At or below threshold</span>
        </div>

        <div className="bg-white border border-[#E7E5E4] p-6 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs uppercase tracking-wider">Customer Base</span>
            <Users className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{customers.length} Profiles</div>
          <span className="text-[11px] text-emerald-700 block">
            {customers.filter((c) => c.marketing_consent).length} opted in to marketing
          </span>
        </div>
      </div>

      {/* Secondary Metrics: Fulfillment Mix & Competitions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Fulfillment Ratio */}
        <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 font-mono">
            Fulfillment Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-700" />
                <span>Home Delivery:</span>
              </div>
              <span className="font-bold text-stone-900">{deliveryOrdersCount} orders</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-stone-700" />
                <span>Store Pickup:</span>
              </div>
              <span className="font-bold text-stone-900">{pickupOrdersCount} orders</span>
            </div>
          </div>
        </div>

        {/* Coupons Redemptions */}
        <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 font-mono">
            Coupon Performance
          </h2>
          <div className="divide-y divide-stone-100">
            {coupons.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">{c.code}</span>
                  <span className="text-stone-400 block text-[10px]">
                    {c.discount_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="font-semibold text-stone-700">
                  {c.current_redemptions_count} redeemed
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Competitions */}
        <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 font-mono">
            Active Competitions
          </h2>
          {activeCompetitions.length === 0 ? (
            <p className="text-stone-400">No active competitions currently running.</p>
          ) : (
            <div className="space-y-3">
              {activeCompetitions.map((comp) => (
                <div key={comp.id} className="p-3 bg-stone-50 border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-900 block truncate">{comp.title}</span>
                  <span className="text-stone-500 block">Prize: {formatETB(comp.prize_value_etb)}</span>
                  <Link
                    href="/admin/bids"
                    className="text-stone-900 underline block pt-1 font-semibold"
                  >
                    Manage &amp; Audit Results →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-medium text-stone-900">Recent Customer Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-black underline"
          >
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Order #</th>
                <th className="pb-3 font-normal">Customer</th>
                <th className="pb-3 font-normal">Method</th>
                <th className="pb-3 font-normal">Status</th>
                <th className="pb-3 font-normal">Payment</th>
                <th className="pb-3 font-normal text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-stone-50/70">
                  <td className="py-3 font-bold text-stone-900">{o.order_number}</td>
                  <td className="py-3">
                    <span className="text-stone-900 block">{o.customer_name}</span>
                    <span className="text-stone-400 text-[10px]">{o.customer_phone}</span>
                  </td>
                  <td className="py-3">
                    {o.fulfillment_type === 'store_pickup' ? 'Store Pickup' : 'Home Delivery'}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-800 uppercase text-[10px]">
                      {o.order_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        o.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-stone-900">
                    {formatETB(o.total_amount_etb)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
