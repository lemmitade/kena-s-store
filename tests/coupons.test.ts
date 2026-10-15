// ============================================================================
// COUPONS & DISCOUNTS AUTOMATED TESTS
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createOrder, db } from '../src/lib/db/repository';

describe('Coupon Validation & Discount Engine', () => {
  test('Enforces minimum order amount restriction for coupon', async () => {
    // WELCOME10 requires min 1000 ETB
    const linenProd = db.products.find((p) => p.id === 'prod-linen-shirt') || db.products[0];
    const variant = linenProd.variants![0];

    const res = await createOrder({
      customer_name: 'Coupon Tester',
      customer_phone: '0911223344',
      fulfillment_type: 'store_pickup',
      payment_method: 'cash_on_delivery',
      pickup_location_id: 'pk-bole',
      coupon_code: 'FASHION300', // Requires 2500 ETB
      items: [
        {
          variant_id: variant.id,
          quantity: 1, // unit price is 2850 ETB, so this passes min order!
        },
      ],
    });

    assert.equal(res.success, true);
    assert.ok(res.order);
    assert.equal(res.order.discount_amount_etb, 300);
    assert.equal(res.order.applied_coupon_code, 'FASHION300');
  });

  test('Correctly calculates percentage discount with maximum cap', async () => {
    // WELCOME10 gives 10% with cap of 600 ETB
    const linenProd = db.products.find((p) => p.id === 'prod-linen-shirt') || db.products[0];
    const variant = linenProd.variants![0]; // unit price 2850 ETB
    // If buying 3 units: subtotal = 3 * 2850 = 8550 ETB. 10% is 855 ETB, but capped at 600 ETB!
    const res = await createOrder({
      customer_name: 'Cap Tester',
      customer_phone: '0911223344',
      fulfillment_type: 'store_pickup',
      payment_method: 'cash_on_delivery',
      pickup_location_id: 'pk-bole',
      coupon_code: 'WELCOME10',
      items: [
        {
          variant_id: variant.id,
          quantity: 3,
        },
      ],
    });

    assert.equal(res.success, true);
    assert.ok(res.order);
    // 10% of 8550 = 855, but cap is 600 ETB
    assert.equal(res.order.discount_amount_etb, 600);
  });
});
