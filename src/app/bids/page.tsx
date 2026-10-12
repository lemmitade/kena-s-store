// ============================================================================
// COMPETITIONS INDEX: /bids
// Active Unique-Lowest-Bid competitions, rules overview, prize catalog
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections, getCompetitions } from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BidsPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();
  const competitions = await getCompetitions();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Editorial Header */}
        <div className="max-w-3xl space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 bg-stone-900 text-amber-400 px-3 py-1 text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audited Promotional Module</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal">
            Unique-Lowest-Bid Competitions
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed">
            A test of strategy and exclusivity. The winner is the eligible participant who enters the lowest valid bid amount submitted by exactly one person.
          </p>
        </div>

        {/* How It Works Explainer Box */}
        <div className="bg-white border border-[#E7E5E4] p-8 sm:p-10 mb-16 space-y-6">
          <div className="flex items-center gap-2 text-stone-900">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-serif font-semibold">How The Unique-Lowest-Bid System Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            <div className="space-y-2 bg-[#FAF9F6] p-5 border border-stone-200">
              <span className="text-stone-400 block uppercase">Rule 01</span>
              <p className="font-semibold text-stone-900 text-sm">Select Your Bid</p>
              <p className="text-stone-600 leading-relaxed">
                Choose any whole ETB amount within the permitted range. You may submit up to the allowed entry limit.
              </p>
            </div>

            <div className="space-y-2 bg-[#FAF9F6] p-5 border border-stone-200">
              <span className="text-stone-400 block uppercase">Rule 02</span>
              <p className="font-semibold text-stone-900 text-sm">Uniqueness Criterion</p>
              <p className="text-stone-600 leading-relaxed">
                If two or more participants submit the exact same bid (e.g. 100 ETB), that bid is tied and eliminated.
              </p>
            </div>

            <div className="space-y-2 bg-[#FAF9F6] p-5 border border-stone-200">
              <span className="text-stone-400 block uppercase">Rule 03</span>
              <p className="font-semibold text-stone-900 text-sm">Lowest Unique Wins</p>
              <p className="text-stone-600 leading-relaxed">
                Among all amounts chosen by exactly one person, the mathematically lowest amount wins the prize.
              </p>
            </div>
          </div>
        </div>

        {/* Active Competitions Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-stone-900 font-semibold">
              Active &amp; Scheduled Competitions
            </h2>
            <Link
              href="/bids/results"
              className="text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-black underline"
            >
              Audited Past Results →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {competitions.map((comp) => {
              const isActive = comp.status === 'active';
              return (
                <div
                  key={comp.id}
                  className="bg-white border border-[#E7E5E4] overflow-hidden flex flex-col group"
                >
                  <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
                    {comp.prize_image_url && (
                      <Image
                        src={comp.prize_image_url}
                        alt={comp.prize_name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <span className="absolute top-3 left-3 bg-[#121212] text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1">
                      {comp.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <span className="text-xs font-mono uppercase text-stone-400">
                        Prize Value: {formatETB(comp.prize_value_etb)}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
                        {comp.title}
                      </h3>
                      <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                        {comp.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-100 font-mono text-xs">
                      <div className="flex justify-between text-stone-500">
                        <span>Bid Range:</span>
                        <span className="text-stone-900 font-semibold">
                          {comp.min_bid_etb} - {comp.max_bid_etb} ETB
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Closes:</span>
                        <span className="text-stone-900">{formatDate(comp.ends_at)}</span>
                      </div>

                      <Link
                        href={`/bids/${comp.slug}`}
                        className={`w-full py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors ${
                          isActive
                            ? 'bg-[#121212] text-white hover:bg-stone-800'
                            : 'bg-stone-200 text-stone-500 pointer-events-none'
                        }`}
                      >
                        <span>{isActive ? 'Enter Competition' : 'Closed / Under Review'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
