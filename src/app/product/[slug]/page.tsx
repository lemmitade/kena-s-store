// ============================================================================
// PRODUCT PAGE: /product/[slug]
// Server component fetching product data, SEO metadata, and related items
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductDetailView } from '@/components/storefront/ProductDetailView';
import {
  getStoreSettings,
  getSections,
  getProductBySlug,
  getProducts,
} from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const settings = await getStoreSettings();

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.seo_title || `${product.name} | ${settings.store_name}`,
    description: product.seo_description || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0].image_url }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const settings = await getStoreSettings();
  const sections = await getSections();
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Related products from the same section
  const allProducts = await getProducts({ sectionSlug: product.section?.slug });
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumbs */}
        <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-black">
            Home
          </Link>{' '}
          /{' '}
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>{' '}
          {product.section && (
            <>
              /{' '}
              <Link href={`/shop/${product.section.slug}`} className="hover:text-black">
                {product.section.name}
              </Link>{' '}
            </>
          )}
          / <span className="text-stone-900 font-semibold">{product.name}</span>
        </nav>

        {/* Product Detail Interactive View */}
        <ProductDetailView product={product} />

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#E7E5E4]">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                  Complementary Sartorial Pieces
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal mt-1">You May Also Admire</h2>
              </div>
              {product.section && (
                <Link
                  href={`/shop/${product.section.slug}`}
                  className="text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-black underline underline-offset-4"
                >
                  View All {product.section.name} →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
