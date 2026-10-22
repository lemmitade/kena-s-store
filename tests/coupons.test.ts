// ============================================================================
// COUPONS & DISCOUNTS AUTOMATED TESTS
// ============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createOrder, createProduct, deleteProduct } from '../src/lib/db/repository';

describe('Coupon Validation & Discount Engine', () => {
  let testProd: any;

  before(async () => {
    testProd = await createProduct({
      name: 'Coupon Test Item',
      slug: `coupon-test-item-${Date.now()}`,
      description: 'Coupon test item',
      regular_price_etb: 2850,
      is_published: true,
      is_featured: false,
      is_new_arrival: false,
      is_archived: false,
      low_stock_threshold: 2,
      variants: [
        {
          id: `var-cp-${Date.now()}`,
          product_id: '',
          sku: `CP-SKU-${Date.now()}`,
          size: 'M',
          color: 'White',
          stock_quantity: 25,
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
    });
  });

  after(async () => {
    if (testProd?.id) {
      await deleteProduct(testProd.id);
    }
  });

  test('Enforces minimum order amount restriction for coupon', async () => {
    const variant = testProd.variants![0];
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
    const variant = testProd.variants![0]; // unit price 2850 ETB
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
