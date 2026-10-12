import { NextRequest, NextResponse } from 'next/server';
import { getCouponByCode } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const subtotalStr = searchParams.get('subtotal') || '0';
  const subtotal = parseInt(subtotalStr, 10) || 0;

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Please enter a coupon code.' }, { status: 400 });
  }

  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return NextResponse.json({ valid: false, error: 'Coupon code not found or expired.' }, { status: 404 });
  }

  if (coupon.min_order_amount_etb && subtotal < coupon.min_order_amount_etb) {
    return NextResponse.json(
      {
        valid: false,
        error: `Minimum order of ${coupon.min_order_amount_etb} ETB is required for coupon ${coupon.code}.`,
      },
      { status: 400 }
    );
  }

  if (coupon.usage_limit_total && coupon.current_redemptions_count >= coupon.usage_limit_total) {
    return NextResponse.json(
      { valid: false, error: 'This coupon has reached its maximum redemptions.' },
      { status: 400 }
    );
  }

  let discountETB = 0;
  if (coupon.discount_type === 'percentage') {
    discountETB = Math.round((subtotal * coupon.discount_value) / 100);
    if (coupon.max_discount_etb && discountETB > coupon.max_discount_etb) {
      discountETB = coupon.max_discount_etb;
    }
  } else if (coupon.discount_type === 'fixed_amount') {
    discountETB = Math.min(coupon.discount_value, subtotal);
  }

  return NextResponse.json({
    valid: true,
    coupon,
    discountETB,
  });
}
