'use server';

// ============================================================================
// SERVER ACTION: COUPON CREATION & MANAGEMENT
// ============================================================================

import { createCoupon, updateCoupon } from '@/lib/db/repository';
import { CouponType } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createCouponAction(formData: {
  code: string;
  discount_type: CouponType;
  discount_value: number;
  max_discount_etb?: number;
  min_order_amount_etb: number;
  usage_limit_total?: number;
  is_new_customer_only: boolean;
}) {
  try {
    const coupon = await createCoupon({
      ...formData,
      usage_limit_per_customer: 1,
      status: 'active',
    });

    revalidatePath('/admin/marketing/coupons');
    return { success: true, coupon };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
