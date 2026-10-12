'use client';

// ============================================================================
// ADMIN COUPON MANAGER COMPONENT
// Lists coupons and provides interactive creation form with restrictions
// ============================================================================

import React, { useState } from 'react';
import { Coupon, CouponType } from '@/types';
import { formatETB } from '@/lib/utils/format';
import { createCouponAction } from '@/app/actions/coupons';
import { Tag, Plus, Check, AlertCircle } from 'lucide-react';

interface CouponManagerProps {
  coupons: Coupon[];
}

export function CouponManager({ coupons }: CouponManagerProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<CouponType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxDiscountETB, setMaxDiscountETB] = useState<number | undefined>(500);
  const [minOrderETB, setMinOrderETB] = useState<number>(1000);
  const [usageLimitTotal, setUsageLimitTotal] = useState<number | undefined>(100);
  const [isNewCustomerOnly, setIsNewCustomerOnly] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    const res = await createCouponAction({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      max_discount_etb: maxDiscountETB,
      min_order_amount_etb: minOrderETB,
      usage_limit_total: usageLimitTotal,
      is_new_customer_only: isNewCustomerOnly,
    });

    setLoading(false);
    if (res.success) {
      setCode('');
      setMsg(`Coupon "${res.coupon?.code}" created and active!`);
    }
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Creation form */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Create New Coupon Code
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Coupon Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. VIP20"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-bold uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Discount Type *</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as CouponType)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="fixed_amount">Fixed Amount Off (ETB)</option>
              <option value="free_delivery">Free Home Delivery</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Discount Value *</label>
            <input
              type="number"
              required
              min={1}
              value={discountValue}
              onChange={(e) => setDiscountValue(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Min Order Amount (ETB)</label>
            <input
              type="number"
              min={0}
              value={minOrderETB}
              onChange={(e) => setMinOrderETB(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Max Discount Cap (ETB)</label>
            <input
              type="number"
              value={maxDiscountETB || ''}
              onChange={(e) => setMaxDiscountETB(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              placeholder="Optional limit"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Global Usage Limit</label>
            <input
              type="number"
              value={usageLimitTotal || ''}
              onChange={(e) => setUsageLimitTotal(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              placeholder="e.g. 500"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewCustomerOnly}
                onChange={(e) => setIsNewCustomerOnly(e.target.checked)}
                className="rounded border-stone-300"
              />
              <span className="text-stone-700">Restricted to First-Time Customers Only</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#121212] text-white px-6 py-2.5 uppercase tracking-wider font-semibold hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '+ Create Coupon'}
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#E7E5E4] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 mb-4">
          Configured Coupons ({coupons.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Code</th>
                <th className="pb-3 font-normal">Type &amp; Benefit</th>
                <th className="pb-3 font-normal">Min Order</th>
                <th className="pb-3 font-normal">Max Discount Cap</th>
                <th className="pb-3 font-normal">Usage Count / Limit</th>
                <th className="pb-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/70">
                  <td className="py-3 font-bold text-stone-900 text-sm">
                    <code>{c.code}</code>
                  </td>
                  <td className="py-3 text-stone-800">
                    {c.discount_type === 'percentage'
                      ? `${c.discount_value}% Off`
                      : c.discount_type === 'fixed_amount'
                      ? `${formatETB(c.discount_value)} Off`
                      : 'Free Delivery'}
                  </td>
                  <td className="py-3 text-stone-600">{formatETB(c.min_order_amount_etb)}</td>
                  <td className="py-3 text-stone-600">
                    {c.max_discount_etb ? formatETB(c.max_discount_etb) : 'Unlimited'}
                  </td>
                  <td className="py-3 font-semibold text-stone-900">
                    {c.current_redemptions_count} / {c.usage_limit_total || '∞'}
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold">
                      {c.status}
                    </span>
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
