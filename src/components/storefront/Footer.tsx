'use client';

// ============================================================================
// STOREFRONT FOOTER: EDITORIAL DESIGN, EDITABLE CONTACT, CONSENT SIGNUP
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/types';
import { ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  settings: StoreSettings;
}

export function Footer({ settings }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [hasConsented, setHasConsented] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!hasConsented) {
      setErrorMsg('Please indicate your consent to receive brand updates.');
      return;
    }

    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#121212] text-[#FAF9F6] border-t border-stone-800 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-stone-800">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <h2 className="font-serif tracking-widest text-2xl font-bold uppercase text-[#FAF9F6]">
              {settings.store_name}
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              {settings.tagline ||
                'Modern sartorial silhouettes tailored in Ethiopia. We craft enduring pieces from highland calfskin, natural flax linen, and artisanal Shemma textiles.'}
            </p>
            <div className="text-xs font-mono text-stone-400 space-y-1">
              <p>{settings.contact_address}</p>
              <p>Direct: {settings.contact_phone}</p>
              <p>Concierge: {settings.contact_email}</p>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-mono text-stone-300">Catalog</h3>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop/men" className="hover:text-white transition-colors">
                  Men’s Essentials
                </Link>
              </li>
              <li>
                <Link href="/shop/women" className="hover:text-white transition-colors">
                  Women’s Tailoring
                </Link>
              </li>
              <li>
                <Link href="/shop/footwear" className="hover:text-white transition-colors">
                  Highland Footwear
                </Link>
              </li>
              <li>
                <Link href="/shop/heritage-fusion" className="hover:text-white transition-colors">
                  Tibeb &amp; Fusion
                </Link>
              </li>
              <li>
                <Link href="/bids" className="hover:text-white transition-colors text-amber-400">
                  Unique-Lowest-Bid
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Services & Policies */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-mono text-stone-300">Client Care</h3>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  Delivery &amp; Pickup
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter with Explicit Consent */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-mono text-stone-300">Editorial Dispatch</h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Receive private previews of seasonal capsule releases and artisanal craftsmanship stories.
            </p>

            {subscribed ? (
              <div className="p-4 bg-stone-900 border border-stone-800 text-stone-200 text-sm flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>You are subscribed to the private dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-stone-500"
                  />
                  <button
                    type="submit"
                    className="bg-white text-stone-950 px-4 py-2.5 hover:bg-stone-200 transition-colors flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-400">
                  <input
                    type="checkbox"
                    checked={hasConsented}
                    onChange={(e) => setHasConsented(e.target.checked)}
                    className="mt-0.5 rounded border-stone-700 bg-stone-900 text-stone-200 focus:ring-0"
                  />
                  <span>
                    I explicitly consent to receiving promotional dispatches and product releases. (You may unsubscribe at any time).
                  </span>
                </label>

                {errorMsg && <p className="text-rose-400 text-xs">{errorMsg}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar & Admin Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} {settings.store_name}. All rights reserved. Addis Ababa, Ethiopia.</p>
          <div className="flex items-center space-x-6">
            <Link href="/bids/results" className="hover:text-stone-300 transition-colors">
              Competition Results
            </Link>
            <Link href="/admin/dashboard" className="text-stone-400 hover:text-stone-200 transition-colors font-mono">
              [Staff Portal]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
