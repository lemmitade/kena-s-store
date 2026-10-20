// ============================================================================
// COMPETITION DETAIL PAGE: /bids/[slug]
// Server component displaying rules, legal safeguards, prize gallery & bidding form
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { BidSubmissionForm } from '@/components/storefront/BidSubmissionForm';
import { getStoreSettings, getSections, getCompetitionBySlug } from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import { ShieldAlert, Clock, Sparkles, Scale, Info, CheckCircle2 } from 'lucide-react';
import { verifyBidPaymentAction } from '@/app/actions/bids';

export const dynamic = 'force-dynamic';

interface CompetitionDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    paid?: string;
    ref?: string;
  }>;
}

export default async function CompetitionDetailPage({
  params,
  searchParams,
}: CompetitionDetailPageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const settings = await getStoreSettings();
  const sections = await getSections();
  const competition = await getCompetitionBySlug(slug);

  if (!competition) {
    notFound();
  }

  // Verify bid payment if returned from Chapa
  let isPaymentVerified = query.paid === 'true';
  if (query.ref) {
    const vResult = await verifyBidPaymentAction(query.ref);
    if (vResult.verified) {
      isPaymentVerified = true;
    }
  }

  const isClosed = new Date().getTime() > new Date(competition.ends_at).getTime();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {isPaymentVerified && (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-600 text-emerald-950 mb-8 space-y-1.5 rounded shadow-sm">
            <div className="flex items-center gap-2 font-bold text-base text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Chapa Entry Fee Paid & Bid Successfully Registered!</span>
            </div>
            <p className="text-xs font-mono text-emerald-800">
              Your payment has been verified. Your secret bid is officially entered into this competition. Good luck!
            </p>
            {query.ref && (
              <p className="text-[11px] font-mono text-emerald-700">
                Payment Reference: <strong>{query.ref}</strong>
              </p>
            )}
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-black">
            Home
          </Link>{' '}
          /{' '}
          <Link href="/bids" className="hover:text-black">
            Competitions
          </Link>{' '}
          / <span className="text-stone-900 font-semibold">{competition.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 1. LEFT COLUMN: PRIZE DETAILS & RULES (7 COLS) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden border border-[#E7E5E4]">
              {competition.prize_image_url && (
                <Image
                  src={competition.prize_image_url}
                  alt={competition.prize_name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              )}
              <div className="absolute top-4 left-4 bg-[#121212] text-white text-[11px] font-mono uppercase tracking-widest px-3 py-1">
                {competition.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                Prize Valuation: {formatETB(competition.prize_value_etb)}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-normal">{competition.title}</h1>
              <p className="text-stone-600 text-sm leading-relaxed font-light whitespace-pre-line">
                {competition.description}
              </p>
            </div>

            {/* Published Rules & Guidelines */}
            <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-stone-900">
                <Scale className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-mono uppercase tracking-wider font-semibold">
                  Official Competition Rules
                </h2>
              </div>
              <div className="text-xs font-mono text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50 p-4 border border-stone-200">
                {competition.rules_text ||
                  '1. Each participant may submit up to the allowed number of bids.\n2. The winner will be the eligible participant who submits the lowest bid amount that is completely unique (chosen by exactly one person).\n3. In the event of no unique bids, no winner is determined.\n4. Results are audited by the store administration before publication.'}
              </div>
            </div>

            {/* Legal Safeguard Notice */}
            <div className="p-4 bg-stone-100 border border-stone-300 text-stone-700 text-xs font-mono flex items-start gap-3">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-600" />
              <div className="space-y-1">
                <span className="font-semibold block uppercase">Compliance &amp; Consumer Transparency</span>
                <p>
                  This competition operates on a deterministic mathematical audit trail. Real paid entries are disabled by default until applicable Ethiopian regulatory and payment-provider licensing approvals are confirmed by the store owner.
                </p>
              </div>
            </div>
          </div>

          {/* 2. RIGHT COLUMN: BIDDING FORM & METRICS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Countdown / Meta Box */}
            <div className="bg-white border border-[#E7E5E4] p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="text-stone-500">Closing Datetime</span>
                <span className="text-stone-900 font-semibold">{formatDate(competition.ends_at)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="text-stone-500">Allowed Bid Bounds</span>
                <span className="text-stone-900 font-semibold">
                  {competition.min_bid_etb} ETB — {competition.max_bid_etb} ETB
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="text-stone-500">Entry Participation Fee</span>
                <span className="text-stone-900 font-semibold text-rose-700">
                  {formatETB(
                    competition.entry_fee_etb > 0
                      ? competition.entry_fee_etb
                      : settings.bidding_preferences?.default_entry_fee_etb || 100
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Max Bids Per Person</span>
                <span className="text-stone-900 font-semibold">{competition.max_bids_per_entry}</span>
              </div>
            </div>

            {/* Bidding Form or Closed Notice */}
            {isClosed || competition.status !== 'active' ? (
              <div className="bg-stone-900 text-white p-8 text-center space-y-4">
                <Clock className="w-10 h-10 text-stone-400 mx-auto" />
                <h3 className="text-xl font-serif">Bidding Closed</h3>
                <p className="text-xs font-mono text-stone-400">
                  This competition is closed or undergoing administrative audit. Verified results will be published shortly.
                </p>
                <Link
                  href="/bids/results"
                  className="inline-block bg-white text-stone-900 px-6 py-3 text-xs font-mono uppercase tracking-wider font-semibold"
                >
                  View Published Results
                </Link>
              </div>
            ) : (
              <BidSubmissionForm
                competition={competition}
                entryFee={settings.bidding_preferences?.default_entry_fee_etb || 100}
              />
            )}
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
