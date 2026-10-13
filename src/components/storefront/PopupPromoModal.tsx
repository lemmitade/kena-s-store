'use client';

// ============================================================================
// STOREFRONT POPUP PROMO AD MODAL (SCROLL & ENTRANCE TRIGGER)
// Activates on entrance timer or scroll threshold; dismissible with coupon copy
// ============================================================================

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PopupAdSettings } from '@/types';
import { X, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';

interface PopupPromoModalProps {
  settings?: PopupAdSettings;
}

export function PopupPromoModal({ settings }: PopupPromoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!settings || !settings.is_enabled) return;

    // Check if user already dismissed this session
    try {
      const dismissed = sessionStorage.getItem('kena_popup_ad_dismissed');
      if (dismissed === 'true') return;
    } catch {
      // Ignore storage errors
    }

    let hasTriggered = false;

    const triggerPopup = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      setIsOpen(true);
    };

    // 1. Timer Trigger
    const timerDelay = (settings.trigger_delay_seconds || 4) * 1000;
    const timerId = setTimeout(() => {
      triggerPopup();
    }, timerDelay);

    // 2. Scroll Trigger
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = (scrollY / docHeight) * 100;
      const targetPercent = settings.trigger_scroll_percent || 20;

      if (scrollPercent >= targetPercent) {
        triggerPopup();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [settings]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('kena_popup_ad_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  const handleCopyCode = () => {
    if (!settings?.promo_code) return;
    navigator.clipboard.writeText(settings.promo_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen || !settings || !settings.is_enabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-lg bg-[#FAF9F6] text-[#121212] border border-stone-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-20 p-2 text-stone-500 hover:text-black hover:bg-stone-200/60 rounded-full transition-colors"
          aria-label="Close Announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Banner Header if Image available */}
        {settings.image_url && (
          <div className="relative h-44 sm:h-52 w-full bg-stone-900 overflow-hidden">
            <Image
              src={settings.image_url}
              alt={settings.headline}
              fill
              sizes="(max-width: 640px) 100vw, 500px"
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-black/30" />
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5 text-center">
          {settings.badge_text && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white text-[10px] uppercase font-mono tracking-widest font-semibold rounded-full">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{settings.badge_text}</span>
            </span>
          )}

          <div className="space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
              {settings.headline}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm font-sans leading-relaxed max-w-sm mx-auto font-light">
              {settings.description}
            </p>
          </div>

          {/* Promo code voucher card */}
          {settings.promo_code && (
            <div className="bg-stone-100 border border-dashed border-stone-400 p-3 sm:p-4 rounded flex items-center justify-between gap-3 max-w-xs mx-auto">
              <div className="text-left font-mono">
                <span className="text-[10px] uppercase text-stone-500 block">Voucher Code:</span>
                <span className="text-base font-bold tracking-widest text-stone-900">
                  {settings.promo_code}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}

          {/* CTA Button */}
          <div className="pt-2">
            <Link
              href={settings.button_link || '/shop'}
              onClick={handleDismiss}
              className="w-full bg-[#121212] text-white py-3.5 px-6 uppercase font-mono text-xs tracking-widest font-semibold hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2 group"
            >
              <span>{settings.button_label || 'Shop Catalog'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-[11px] font-mono text-stone-400 hover:text-stone-700 underline tracking-wider"
          >
            No thanks, continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
