// ============================================================================
// ADMIN NEW PRODUCT PAGE: /admin/products/new
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';
import { getSections, getCategories } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const sections = await getSections();
  const categories = await getCategories();

  return (
    <div className="max-w-4xl space-y-6">
      <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider">
        <Link href="/admin/products" className="hover:text-black">
          Products
        </Link>{' '}
        / <span className="text-stone-900 font-semibold">New Creation</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900">
        Create Sartorial Piece
      </h1>

      <ProductEditorForm sections={sections} categories={categories} />
    </div>
  );
}
