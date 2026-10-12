// ============================================================================
// HOMEPAGE: EDITORIAL BRAND EXPERIENCE (INSPIRED BY COS, ZARA & APPLE)
// Dynamic sections, featured catalog, active competition module, brand story
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  getStoreSettings,
  getSections,
  getProducts,
  getCompetitions,
  getPickupLocations,
  getDeliveryZones,
} from '@/lib/db/repository';
import { formatETB } from '@/lib/utils/format';
import { ArrowRight, ShieldCheck, MapPin, Sparkles, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getStoreSettings();
  const sections = await getSections();
  const featuredProducts = await getProducts({ isFeatured: true });
  const newArrivals = await getProducts({ isNewArrival: true });
  const competitions = await getCompetitions();
  const activeCompetition = competitions.find((c) => c.status === 'active');
  const pickupLocations = await getPickupLocations();
  const deliveryZones = await getDeliveryZones();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1">
        {/* =====================================================================
            1. EDITORIAL HERO SECTION
            ===================================================================== */}
        <section className="relative h-[85vh] min-h-[580px] w-full bg-stone-900 overflow-hidden flex items-end">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="Editorial Ethiopian Fashion"
            fill
            priority
            className="object-cover object-top opacity-85 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 w-full">
            <div className="max-w-2xl space-y-6">
              <span className="inline-block text-xs uppercase tracking-[0.3em] font-mono text-stone-300">
                Autumn / Winter 2026 Collection
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light text-[#FAF9F6] leading-[1.08] tracking-tight">
                Quiet Tailoring. <br />
                Artisanal Roots.
              </h1>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg font-light">
                Understated luxury tailored in Addis Ababa. Pure linen drapes, Highland calfskin, and ancient Shemma weaving reinterpreted for the modern wardrobe.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="bg-[#FAF9F6] text-[#121212] px-8 py-4 text-xs tracking-widest uppercase font-semibold hover:bg-stone-200 transition-colors inline-flex items-center gap-2 group"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                {activeCompetition && (
                  <Link
                    href={`/bids/${activeCompetition.slug}`}
                    className="border border-white/60 text-white backdrop-blur-sm px-6 py-4 text-xs tracking-widest uppercase font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                  >
                    <span>Competition: {activeCompetition.prize_name}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            2. DYNAMIC STORE SECTIONS (GRID)
            ===================================================================== */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                Departmental Collections
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium mt-1">Curated Sections</h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest font-mono text-stone-600 hover:text-black transition-colors mt-2 sm:mt-0 flex items-center gap-1 group"
            >
              <span>View All Collections</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {sections
              .filter((s) => s.is_home_visible)
              .slice(0, 4)
              .map((section, idx) => {
                // Curated visual editorial images for category cards
                const images = [
                  'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
                ];
                const bgImage = section.thumbnail_image_url || images[idx % images.length];

                return (
                  <Link
                    key={section.id}
                    href={`/shop/${section.slug}`}
                    className="group relative aspect-[3/4] overflow-hidden bg-stone-200 block"
                  >
                    <Image
                      src={bgImage}
                      alt={section.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-stone-300 block">
                        Collection
                      </span>
                      <h3 className="text-lg sm:text-xl font-serif text-white font-medium">
                        {section.name}
                      </h3>
                      <p className="text-stone-300 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-1">
                        {section.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* =====================================================================
            3. FEATURED PRODUCTS
            ===================================================================== */}
        <section className="py-16 bg-[#F5F5F3] border-y border-[#E7E5E4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                  Selected Pieces
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-medium mt-1">Featured Editorial</h2>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-widest font-mono text-stone-600 hover:text-black transition-colors mt-2 sm:mt-0 flex items-center gap-1 group"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. UNIQUE-LOWEST-BID COMPETITION HIGHLIGHT
            ===================================================================== */}
        {activeCompetition && (
          <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#121212] text-[#FAF9F6] p-8 sm:p-14 lg:p-20 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-stone-800 px-3 py-1 text-xs font-mono uppercase tracking-widest text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Unique-Lowest-Bid Competition</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-serif font-normal leading-tight">
                    {activeCompetition.title}
                  </h2>

                  <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                    {activeCompetition.description} The winner is determined mathematically by the participant who enters the lowest valid bid amount selected by exactly one eligible person.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-stone-800 max-w-md font-mono text-xs">
                    <div>
                      <span className="text-stone-500 block uppercase">Retail Value</span>
                      <span className="text-stone-200 font-semibold text-sm sm:text-base">
                        {formatETB(activeCompetition.prize_value_etb)}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block uppercase">Entry Fee</span>
                      <span className="text-stone-200 font-semibold text-sm sm:text-base">
                        {activeCompetition.entry_fee_etb === 0
                          ? 'FREE'
                          : formatETB(activeCompetition.entry_fee_etb)}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block uppercase">Bid Range</span>
                      <span className="text-stone-200 font-semibold text-sm sm:text-base">
                        {activeCompetition.min_bid_etb} - {activeCompetition.max_bid_etb} ETB
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-4">
                    <Link
                      href={`/bids/${activeCompetition.slug}`}
                      className="bg-white text-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-stone-200 transition-colors inline-flex items-center gap-2 group"
                    >
                      <span>Submit Your Bid</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/bids/results"
                      className="border border-stone-700 px-6 py-3.5 text-xs font-mono uppercase tracking-wider text-stone-300 hover:text-white hover:border-stone-500 transition-colors"
                    >
                      Audit Past Results
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 relative aspect-square sm:aspect-[4/3] lg:aspect-square overflow-hidden bg-stone-800">
                  {activeCompetition.prize_image_url && (
                    <Image
                      src={activeCompetition.prize_image_url}
                      alt={activeCompetition.prize_name}
                      fill
                      className="object-cover object-center"
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-stone-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            5. NEW ARRIVALS
            ===================================================================== */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                Fresh Off The Looms
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium mt-1">New Arrivals</h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest font-mono text-stone-600 hover:text-black transition-colors mt-2 sm:mt-0 flex items-center gap-1 group"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* =====================================================================
            6. LOGISTICS & FULFILLMENT ASSURANCE
            ===================================================================== */}
        <section className="py-16 border-t border-[#E7E5E4] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 p-6 bg-[#FAF9F6] border border-stone-200">
                <MapPin className="w-6 h-6 text-stone-900" />
                <h3 className="text-base font-serif font-semibold">Store Pickup in Addis Ababa</h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Collect free of charge with your personal PIN code from our Bole Flagship Store, Kazanchis Studio, or Sarbet Old Airport gallery.
                </p>
                <Link
                  href="/delivery"
                  className="text-xs font-mono uppercase tracking-wider text-stone-900 underline underline-offset-4 pt-1 inline-block"
                >
                  View {pickupLocations.length} Pickup Locations →
                </Link>
              </div>

              <div className="space-y-3 p-6 bg-[#FAF9F6] border border-stone-200">
                <ShieldCheck className="w-6 h-6 text-stone-900" />
                <h3 className="text-base font-serif font-semibold">Home &amp; Regional Delivery</h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Transparent zone fees starting at 200 ETB. Complimentary express delivery across Addis Ababa on all orders above 2,500 ETB.
                </p>
                <Link
                  href="/delivery"
                  className="text-xs font-mono uppercase tracking-wider text-stone-900 underline underline-offset-4 pt-1 inline-block"
                >
                  View Delivery Zones →
                </Link>
              </div>

              <div className="space-y-3 p-6 bg-[#FAF9F6] border border-stone-200">
                <Sparkles className="w-6 h-6 text-stone-900" />
                <h3 className="text-base font-serif font-semibold">Verified Flexible Payments</h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Pay securely with Cash on Delivery (COD) upon inspection, or via Chapa digital payment with immediate server-verified confirmation.
                </p>
                <span className="text-xs font-mono uppercase tracking-wider text-stone-500 pt-1 inline-block">
                  Cash on Delivery &amp; Chapa Enabled
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
