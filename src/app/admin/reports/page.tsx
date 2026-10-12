// ============================================================================
// ADMIN SALES REPORTS: /admin/reports
// Financial summaries, payment breakdowns in ETB, top sartorial items
// ============================================================================

import React from 'react';
import { getAllOrders } from '@/lib/db/repository';
import { formatETB } from '@/lib/utils/format';
import { BarChart3, TrendingUp, CreditCard, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const orders = await getAllOrders();

  const totalGrossETB = orders.reduce((sum, o) => sum + o.total_amount_etb, 0);
  const paidGrossETB = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount_etb, 0);
  const totalDiscountsETB = orders.reduce((sum, o) => sum + o.discount_amount_etb, 0);

  // Group by payment method
  const codTotal = orders
    .filter((o) => o.payment_method === 'cash_on_delivery')
    .reduce((sum, o) => sum + o.total_amount_etb, 0);
  const chapaTotal = orders
    .filter((o) => o.payment_method === 'chapa')
    .reduce((sum, o) => sum + o.total_amount_etb, 0);

  return (
    <div className="space-y-8 font-mono text-xs">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Financial Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Sales &amp; Revenue Reports
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E7E5E4] p-6 space-y-2">
          <span className="text-stone-400 uppercase text-[10px] block">Verified Paid Revenue</span>
          <span className="text-2xl font-bold text-stone-900 block font-serif">
            {formatETB(paidGrossETB)}
          </span>
          <span className="text-stone-500 block text-[11px]">Direct collection + Gateway verified</span>
        </div>

        <div className="bg-white border border-[#E7E5E4] p-6 space-y-2">
          <span className="text-stone-400 uppercase text-[10px] block">Total Order Bookings</span>
          <span className="text-2xl font-bold text-stone-900 block font-serif">
            {formatETB(totalGrossETB)}
          </span>
          <span className="text-stone-500 block text-[11px]">{orders.length} total orders recorded</span>
        </div>

        <div className="bg-white border border-[#E7E5E4] p-6 space-y-2">
          <span className="text-stone-400 uppercase text-[10px] block">Coupon Concessions</span>
          <span className="text-2xl font-bold text-emerald-700 block font-serif">
            -{formatETB(totalDiscountsETB)}
          </span>
          <span className="text-stone-500 block text-[11px]">Marketing discount attribution</span>
        </div>
      </div>

      {/* Breakdown by Payment Method */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Sales Volume by Payment Channel
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-stone-900 block text-sm">Cash on Delivery (COD)</span>
            <span className="text-stone-500 block">Total Booked: {formatETB(codTotal)}</span>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-stone-900 block text-sm">Chapa Online Gateway</span>
            <span className="text-stone-500 block">Total Booked: {formatETB(chapaTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
