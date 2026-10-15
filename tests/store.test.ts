// ============================================================================
// STORE & INVENTORY AUTOMATED TESTS
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createProduct,
  getProducts,
  createOrder,
  db,
  overrideOrderDeliveryFee,
} from '../src/lib/db/repository';

describe('Storefront & Inventory Lifecycle', () => {
  test('Creates product with variants and checks initial stock', async () => {
    const prod = await createProduct({
      name: 'Test Tailored Linen Vest',
      slug: 'test-tailored-linen-vest',
      description: 'Linen vest test description.',
      regular_price_etb: 1800,
      is_featured: false,
      is_new_arrival: true,
      is_published: true,
      is_archived: false,
      low_stock_threshold: 2,
      variants: [
        {
          id: 'test-v-m',
          product_id: '',
          sku: 'TST-VEST-M',
          size: 'M',
          color: 'Sand',
          stock_quantity: 5,
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
    });

    assert.equal(prod.name, 'Test Tailored Linen Vest');
    assert.equal(prod.variants?.[0].stock_quantity, 5);

    const fetched = await getProducts({ searchQuery: 'Test Tailored Linen' });
    assert.equal(fetched.length >= 1, true);

    // Clean up
    await (await import('../src/lib/db/repository')).deleteProduct(prod.id);
  });

  test('Performs guest checkout, atomically deducts variant inventory', async () => {
    const testProd = db.products.find((p) => p.id === 'prod-wool-trousers') || db.products[0];
    const initialVariant = testProd.variants![0];
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
    const testProd = db.products.find((p) => p.id === 'prod-wool-trousers') || db.products[0];
    const variant = testProd.variants![0];
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
