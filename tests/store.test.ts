// ============================================================================
// STORE & INVENTORY AUTOMATED TESTS
// ============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  createProduct,
  deleteProduct,
  getProducts,
  createOrder,
  db,
  overrideOrderDeliveryFee,
} from '../src/lib/db/repository';

describe('Storefront & Inventory Lifecycle', () => {
  let prod: any;

  before(async () => {
    prod = await createProduct({
      name: 'Test Tailored Linen Vest',
      slug: `test-tailored-linen-vest-${Date.now()}`,
      description: 'Linen vest test description.',
      regular_price_etb: 1800,
      is_featured: false,
      is_new_arrival: true,
      is_published: true,
      is_archived: false,
      low_stock_threshold: 2,
      variants: [
        {
          id: `test-v-m-${Date.now()}`,
          product_id: '',
          sku: `TST-VEST-M-${Date.now()}`,
          size: 'M',
          color: 'Sand',
          stock_quantity: 10,
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
    });
  });

  after(async () => {
    if (prod?.id) {
      await deleteProduct(prod.id);
    }
  });

  test('Creates product with variants and checks initial stock', async () => {
    assert.equal(prod.name, 'Test Tailored Linen Vest');
    assert.equal(prod.variants?.[0].stock_quantity, 10);

    const fetched = await getProducts({ searchQuery: 'Test Tailored Linen' });
    assert.equal(fetched.length >= 1, true);
  });

  test('Performs guest checkout, atomically deducts variant inventory', async () => {
    const initialVariant = prod.variants![0];
    const initialStock = initialVariant.stock_quantity;
    const qtyToBuy = 2;

    const res = await createOrder({
      customer_name: 'Test Buyer',
      customer_phone: '0911223344',
      fulfillment_type: 'store_pickup',
      payment_method: 'cash_on_delivery',
      pickup_location_id: 'pk-bole',
      items: [
        {
          variant_id: initialVariant.id,
          quantity: qtyToBuy,
        },
      ],
    });

    assert.equal(res.success, true);
    assert.ok(res.order);
    assert.equal(res.order.customer_name, 'Test Buyer');
    assert.equal(res.order.fulfillment_type, 'store_pickup');
    assert.ok(res.order.fulfillment?.pickup_reference_code);

    // Verify stock was decremented by exactly qtyToBuy
    assert.equal(initialVariant.stock_quantity, initialStock - qtyToBuy);
  });

  test('Prevents overselling when requested quantity exceeds available stock', async () => {
    const variant = prod.variants![0];
    const excessiveQty = variant.stock_quantity + 999;

    const res = await createOrder({
      customer_name: 'Excess Buyer',
      customer_phone: '0911223344',
      fulfillment_type: 'store_pickup',
      payment_method: 'cash_on_delivery',
      pickup_location_id: 'pk-bole',
      items: [
        {
          variant_id: variant.id,
          quantity: excessiveQty,
        },
      ],
    });

    assert.equal(res.success, false);
    assert.match(res.error || '', /Insufficient stock/);
  });

  test('Preserves immutable delivery fee snapshot and logs manual fee override', async () => {
    const order = db.orders[0];
    const originalFee = order.delivery_fee_etb;

    const updated = await overrideOrderDeliveryFee(
      order.id,
      50,
      'Customer concession discount',
      'Manager Sara'
    );

    assert.ok(updated);
    assert.equal(updated.delivery_fee_etb, 50);

    // Verify audit log entry was created
    const log = db.auditLogs.find((l) => l.action === 'fee_override');
    assert.ok(log);
    assert.equal(log.staff_name, 'Manager Sara');
    assert.equal((log.details as any).originalFee, originalFee);
  });
});
