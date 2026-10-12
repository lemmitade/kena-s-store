// ============================================================================
// SHOP PAGE: ALL PRODUCTS CATALOG WITH DYNAMIC SECTION & CATEGORY FILTERING
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { getStoreSettings, getSections, getProducts } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{
    section?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const settings = await getStoreSettings();
  const sections = await getSections();
  const products = await getProducts({
    sectionSlug: params.section,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header Breadcrumb & Title */}
        <div className="border-b border-[#E7E5E4] pb-8 mb-10">
          <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-black">
              Home
            </Link>{' '}
            / <span className="text-stone-900 font-semibold">All Collections</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-serif font-normal">Ready-to-Wear Catalog</h1>
              <p className="text-stone-600 text-sm mt-2 font-light max-w-xl">
                Explore our full line of minimalist outerwear, highland leather goods, and handspun Shemma pieces.
              </p>
            </div>
            <div className="text-xs font-mono text-stone-500">
              Showing {products.length} {products.length === 1 ? 'Design' : 'Designs'}
            </div>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-mono tracking-wider uppercase border-b border-stone-200">
          <Link
            href="/shop"
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              !params.section
                ? 'bg-[#121212] text-[#FAF9F6] font-semibold'
                : 'bg-stone-200/70 text-stone-800 hover:bg-stone-300'
            }`}
          >
            All Pieces ({products.length})
          </Link>
          {sections.map((sec) => (
            <Link
              key={sec.id}
              href={`/shop/${sec.slug}`}
              className={`px-4 py-2 whitespace-nowrap transition-colors ${
                params.section === sec.slug
                  ? 'bg-[#121212] text-[#FAF9F6] font-semibold'
                  : 'bg-stone-200/70 text-stone-800 hover:bg-stone-300'
              }`}
            >
              {sec.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-stone-600">No pieces found in this category.</p>
            <p className="text-sm font-mono text-stone-400 mt-2">
              Browse our other curated collections.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block bg-[#121212] text-white px-6 py-3 text-xs uppercase font-mono tracking-widest"
            >
              View All Products
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
