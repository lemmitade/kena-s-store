// ============================================================================
// ADMIN MARKETING COUPONS: /admin/marketing/coupons
// ============================================================================

import React from 'react';
import { getAllCoupons } from '@/lib/db/repository';
import { CouponManager } from '@/components/admin/CouponManager';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons();

  return (
    <div className="space-y-6 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Promotional Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Discount Codes &amp; Vouchers
        </h1>
      </div>

      <CouponManager coupons={coupons} />
    </div>
  );
}
