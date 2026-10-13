// ============================================================================
// ADMIN PRODUCT EDIT PAGE: /admin/products/[id]
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';
import { getProductById, getProductBySlug, getSections, getCategories } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = (await getProductById(id)) || (await getProductBySlug(id));

  if (!product) {
    notFound();
  }

  const sections = await getSections();
  const categories = await getCategories();

  return (
    <div className="max-w-5xl space-y-6">
      <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider flex items-center gap-2">
        <Link href="/admin/products" className="hover:text-black">
          Products
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">{product.name}</span>
        <span>/</span>
        <span className="text-stone-500">Edit</span>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900">
          Edit Product &amp; Variant Matrix
        </h1>
        <p className="text-xs font-mono text-stone-500 mt-1">
          Update prices, descriptions, images, SKUs, and inventory stock levels.
        </p>
      </div>

      <ProductEditorForm
        sections={sections}
        categories={categories}
        initialProduct={product}
      />
    </div>
  );
}
