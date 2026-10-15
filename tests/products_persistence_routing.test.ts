// ============================================================================
// TESTS: PRODUCT ROUTING, URLS, PERSISTENCE, & EDITING
// Verifies fix for 404 errors, product disappearance, and editing operations
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  db,
} from '../src/lib/db/repository';

describe('Product Routing & 404 Prevention', () => {
  test('Resolves product by exact slug, case-insensitive slug, and URL-encoded slug', async () => {
    const slug = 'relaxed-pure-linen-camp-shirt';
    const byExact = await getProductBySlug(slug);
    assert.ok(byExact, 'Should find product by exact slug');
    assert.equal(byExact.id, 'prod-linen-shirt');

    // Case-insensitive slug
    const byUpper = await getProductBySlug('RELAXED-PURE-LINEN-CAMP-SHIRT');
    assert.ok(byUpper, 'Should find product by uppercase slug');
    assert.equal(byUpper.id, 'prod-linen-shirt');

    // URL-encoded slug
    const byEncoded = await getProductBySlug(encodeURIComponent('relaxed-pure-linen-camp-shirt'));
    assert.ok(byEncoded, 'Should find product by URL-encoded slug');
    assert.equal(byEncoded.id, 'prod-linen-shirt');
  });

  test('Resolves product by product ID on the slug route (preventing 404 when ID is used in URL)', async () => {
    const byId = await getProductBySlug('prod-linen-shirt');
    assert.ok(byId, 'Should resolve product when product ID is passed to getProductBySlug');
    assert.equal(byId.slug, 'relaxed-pure-linen-camp-shirt');

    // Case-insensitive ID lookup
    const byIdUpper = await getProductBySlug('PROD-LINEN-SHIRT');
    assert.ok(byIdUpper, 'Should resolve product with case-insensitive ID');
  });

  test('getProductById resolves by both ID and slug', async () => {
    const byId = await getProductById('prod-wool-trousers');
    assert.ok(byId);
    assert.equal(byId.id, 'prod-wool-trousers');

    const bySlug = await getProductById('pleated-high-waist-wool-trousers');
    assert.ok(bySlug);
    assert.equal(bySlug.id, 'prod-wool-trousers');
  });
});

describe('Product Database Persistence Across Restarts & Refreshes', () => {
  const testSlug = `persistence-test-${Date.now()}`;
  let createdProductId = '';

  test('Creates a product and immediately persists it to disk store_state.json', async () => {
    const newProd = await createProduct({
      name: 'Artisanal Cashmere Scarf',
      slug: testSlug,
      description: 'Handspun Ethiopian highland cashmere scarf.',
      regular_price_etb: 3200,
      is_published: true,
      is_featured: true,
      is_new_arrival: true,
      is_archived: false,
      low_stock_threshold: 2,
      images: [
        {
          id: 'img-test-1',
          product_id: '',
          image_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9',
          alt_text: 'Cashmere Scarf',
          display_order: 1,
          is_primary: true,
        },
      ],
      variants: [
        {
          id: 'var-test-1',
          product_id: '',
          sku: 'CSH-SCF-NAT-OS',
          size: 'OS',
          color: 'Natural Cream',
          stock_quantity: 12,
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
    });

    createdProductId = newProd.id;
    assert.ok(createdProductId, 'Should return created product with ID');
    assert.equal(newProd.is_published, true);

    // Verify disk file contains the product
    const filePath = path.join(process.cwd(), '.data', 'store_state.json');
    assert.ok(fs.existsSync(filePath), 'store_state.json must exist');

    const raw = fs.readFileSync(filePath, 'utf-8');
    const diskState = JSON.parse(raw);
    assert.ok(Array.isArray(diskState.products), 'disk state must contain products array');

    const foundOnDisk = diskState.products.find((p: any) => p.id === createdProductId);
    assert.ok(foundOnDisk, 'Newly created product must be written to disk');
    assert.equal(foundOnDisk.name, 'Artisanal Cashmere Scarf');
    assert.equal(foundOnDisk.is_published, true);
  });

  test('Published product remains available after querying and listing', async () => {
    const list = await getProducts();
    const found = list.find((p) => p.id === createdProductId);
    assert.ok(found, 'Published product must appear in published products listing');
    assert.equal(found.is_published, true);

    const directLookup = await getProductBySlug(testSlug);
    assert.ok(directLookup, 'Direct lookup by slug must succeed');
    assert.equal(directLookup.name, 'Artisanal Cashmere Scarf');

    // Clean up
    if (createdProductId) {
      await deleteProduct(createdProductId);
    }
  });
});

describe('Product Editing & Database Operations', () => {
  let editProductId = '';

  test('Creates a product and saves edits to name, price, stock, and description', async () => {
    const prod = await createProduct({
      name: 'Original Handwoven Shawl',
      slug: `edit-shawl-${Date.now()}`,
      description: 'Original description',
      regular_price_etb: 2000,
      sale_price_etb: undefined,
      is_published: true,
      is_featured: false,
      is_new_arrival: false,
      is_archived: false,
      low_stock_threshold: 3,
      variants: [
        {
          id: 'var-sh-1',
          product_id: '',
          sku: 'SHWL-ORIG-1',
          size: 'M',
          color: 'White',
          stock_quantity: 5,
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
    });

    editProductId = prod.id;

    // Now execute an update
    const updated = await updateProduct(editProductId, {
      name: 'Updated Luxury Handwoven Silk Shawl',
      regular_price_etb: 4500,
      sale_price_etb: 3900,
      description: 'Updated premium silk description tailored in Addis.',
      variants: [
        {
          id: 'var-sh-1',
          product_id: editProductId,
          sku: 'SHWL-SILK-UPDATED',
          size: 'L',
          color: 'Ivory Gold',
          stock_quantity: 25,
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
    });

    assert.ok(updated, 'updateProduct should return the updated product');
    assert.equal(updated.name, 'Updated Luxury Handwoven Silk Shawl');
    assert.equal(updated.regular_price_etb, 4500);
    assert.equal(updated.sale_price_etb, 3900);
    assert.equal(updated.description, 'Updated premium silk description tailored in Addis.');
    assert.equal(updated.variants?.[0].stock_quantity, 25);
    assert.equal(updated.variants?.[0].color, 'Ivory Gold');

    // Verify disk has the updated data
    const filePath = path.join(process.cwd(), '.data', 'store_state.json');
    const diskState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const diskProd = diskState.products.find((p: any) => p.id === editProductId);

    assert.ok(diskProd, 'Product must exist on disk after edit');
    assert.equal(diskProd.name, 'Updated Luxury Handwoven Silk Shawl');
    assert.equal(diskProd.regular_price_etb, 4500);
    assert.equal(diskProd.variants[0].stock_quantity, 25);

    // Clean up
    await deleteProduct(editProductId);
    const afterDelete = await getProductById(editProductId);
    assert.equal(afterDelete, null, 'Deleted product should no longer be found');
  });
});
