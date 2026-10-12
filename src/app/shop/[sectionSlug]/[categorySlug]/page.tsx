// ============================================================================
// NESTED CATEGORY SHOP PAGE: /shop/[sectionSlug]/[categorySlug]
// Shows products strictly filtered to section + category
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  getStoreSettings,
  getSections,
  getSectionBySlug,
  getCategoryBySlug,
  getProducts,
} from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    sectionSlug: string;
    categorySlug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { sectionSlug, categorySlug } = await params;
  const settings = await getStoreSettings();
  const sections = await getSections();
  const section = await getSectionBySlug(sectionSlug);

  if (!section) {
    notFound();
  }

  const category = await getCategoryBySlug(sectionSlug, categorySlug);
  if (!category) {
    notFound();
  }

  const products = await getProducts({
    sectionSlug,
    categorySlug,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="border-b border-[#E7E5E4] pb-8 mb-10">
          <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-black">
              Home
            </Link>{' '}
            /{' '}
            <Link href="/shop" className="hover:text-black">
              Shop
            </Link>{' '}
            /{' '}
            <Link href={`/shop/${section.slug}`} className="hover:text-black">
              {section.name}
            </Link>{' '}
            / <span className="text-stone-900 font-semibold">{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-serif font-normal">{category.name}</h1>
              <p className="text-stone-600 text-sm mt-2 font-light max-w-xl">
                {category.description || `Artisanal ${category.name.toLowerCase()} tailored in Ethiopia.`}
              </p>
            </div>
            <div className="text-xs font-mono text-stone-500">
              {products.length} {products.length === 1 ? 'Design' : 'Designs'}
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-stone-600">No items found in {category.name}.</p>
            <Link
              href={`/shop/${section.slug}`}
              className="mt-6 inline-block bg-[#121212] text-white px-6 py-3 text-xs uppercase font-mono tracking-widest"
            >
              Back to {section.name}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
