// ============================================================================
// DYNAMIC SECTION SHOP PAGE: /shop/[sectionSlug]
// Shows section products, nested category pills, and section description
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
  getCategories,
  getProducts,
} from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

interface SectionPageProps {
  params: Promise<{
    sectionSlug: string;
  }>;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { sectionSlug } = await params;
  const settings = await getStoreSettings();
  const sections = await getSections();
  const section = await getSectionBySlug(sectionSlug);

  if (!section) {
    notFound();
  }

  const categories = await getCategories(section.id);
  const products = await getProducts({ sectionSlug });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Breadcrumb & Section Header */}
        <div className="border-b border-[#E7E5E4] pb-8 mb-10">
          <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-black">
              Home
            </Link>{' '}
            /{' '}
            <Link href="/shop" className="hover:text-black">
              Shop
            </Link>{' '}
            / <span className="text-stone-900 font-semibold">{section.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-serif font-normal">{section.name}</h1>
              <p className="text-stone-600 text-sm mt-2 font-light max-w-xl">
                {section.description ||
                  `Explore our curated selection of ${section.name.toLowerCase()} tailored in Ethiopia.`}
              </p>
            </div>
            <div className="text-xs font-mono text-stone-500">
              {products.length} {products.length === 1 ? 'Design' : 'Designs'}
            </div>
          </div>
        </div>

        {/* Categories Under This Section */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-mono tracking-wider uppercase border-b border-stone-200">
            <Link
              href={`/shop/${section.slug}`}
              className="px-4 py-2 bg-[#121212] text-[#FAF9F6] font-semibold whitespace-nowrap"
            >
              All {section.name}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/${section.slug}/${cat.slug}`}
                className="px-4 py-2 bg-stone-200/70 text-stone-800 hover:bg-stone-300 whitespace-nowrap transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-stone-600">No items available in this section yet.</p>
            <Link
              href="/shop"
              className="mt-6 inline-block bg-[#121212] text-white px-6 py-3 text-xs uppercase font-mono tracking-widest"
            >
              Explore Full Catalog
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
