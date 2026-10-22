import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getProductBySlug,
} from '../src/lib/db/repository';

describe('Permanent Product Deletion & Anti-Resurrection', () => {
  test('Deletes created product and ensures it does not reappear after state refresh', async () => {
    const slug = `delete-test-${Date.now()}`;
    const product = await createProduct({
      name: 'Temporary Deletion Test Item',
      slug,
      description: 'To be deleted permanently',
      regular_price_etb: 1500,
      is_published: true,
      is_featured: false,
      is_new_arrival: false,
      is_archived: false,
      low_stock_threshold: 2,
      variants: [
        {
          id: `var-${Date.now()}`,
          product_id: '',
          sku: `SKU-${Date.now()}`,
          stock_quantity: 5,
          size: 'M',
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
    });

    assert.ok(product?.id, 'Product should be created with an ID');

    // Confirm it exists
    const beforeList = await getProducts({ includeDrafts: true });
    assert.ok(
      beforeList.some((p) => p.id === product.id),
      'Product must be in list before deletion'
    );

    // Perform permanent deletion
    const deleted = await deleteProduct(product.id);
    assert.equal(deleted, true, 'deleteProduct should return true');

    // Confirm it is gone
    const afterList = await getProducts({ includeDrafts: true });
    assert.equal(
      afterList.some((p) => p.id === product.id || p.slug === slug),
      false,
      'Product must NOT be in product listing after deletion'
    );

    const lookupById = await getProductById(product.id);
    assert.equal(lookupById, null, 'Lookup by id must return null after deletion');

    const lookupBySlug = await getProductBySlug(slug, { allowDrafts: true });
    assert.equal(lookupBySlug, null, 'Lookup by slug must return null after deletion');
  });
});
