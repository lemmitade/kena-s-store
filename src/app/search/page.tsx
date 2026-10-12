// ============================================================================
// PRODUCT SEARCH PAGE: /search
// Real-time catalog search across titles, descriptions, colors, and SKUs
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { getStoreSettings, getSections, getProducts } from '@/lib/db/repository';
import { Search as SearchIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const settings = await getStoreSettings();
  const sections = await getSections();
  const query = q?.trim() || '';

  const results = query ? await getProducts({ searchQuery: query }) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Search Input Bar */}
        <div className="max-w-2xl mx-auto text-center space-y-6 mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-stone-500">
            Archive Search
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light">Search the Catalog</h1>

          <form action="/search" method="GET" className="relative mt-6">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by piece name, fabric, color, or SKU..."
              className="w-full bg-white border border-stone-300 pl-12 pr-28 py-4 text-base focus:outline-none focus:border-stone-900 transition-colors font-light placeholder-stone-400"
            />
            <SearchIcon className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#121212] text-white px-5 py-2.5 text-xs uppercase font-mono tracking-wider hover:bg-stone-800 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick suggestion terms */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono text-stone-500">
            <span>Suggestions:</span>
            <Link href="/search?q=Linen" className="underline hover:text-black">
              Linen
            </Link>
            <span>•</span>
            <Link href="/search?q=Leather" className="underline hover:text-black">
              Leather
            </Link>
            <span>•</span>
            <Link href="/search?q=Tibeb" className="underline hover:text-black">
              Tibeb
            </Link>
            <span>•</span>
            <Link href="/search?q=Charcoal" className="underline hover:text-black">
              Charcoal
            </Link>
          </div>
        </div>

        {/* Results Header & Grid */}
        {query ? (
          <div>
            <div className="border-b border-[#E7E5E4] pb-4 mb-8 flex items-baseline justify-between">
              <h2 className="text-sm font-mono uppercase tracking-wider text-stone-600">
                Results for &ldquo;<span className="text-stone-900 font-bold">{query}</span>&rdquo;
              </h2>
              <span className="text-xs font-mono text-stone-400">
                {results.length} {results.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="font-serif text-2xl text-stone-600">
                  No products matched your search query.
                </p>
                <p className="text-xs font-mono text-stone-400">
                  Try checking your spelling or searching for broader terms like &quot;shirt&quot;, &quot;trousers&quot;, or &quot;leather&quot;.
                </p>
                <Link
                  href="/shop"
                  className="inline-block mt-4 bg-[#121212] text-white px-6 py-3 text-xs uppercase font-mono tracking-widest"
                >
                  Browse All Collections
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
