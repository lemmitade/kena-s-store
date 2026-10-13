'use client';

// ============================================================================
// ADMIN POP-UP ADS EDITOR FORM
// ============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { PopupAdSettings } from '@/types';
import { updatePopupAdAction } from '@/app/actions/content';
import { Check, AlertCircle, Sparkles, Copy, Eye, Megaphone } from 'lucide-react';

interface PopAdsEditorFormProps {
  initialSettings: PopupAdSettings;
}

export function PopAdsEditorForm({ initialSettings }: PopAdsEditorFormProps) {
  const [isEnabled, setIsEnabled] = useState(initialSettings.is_enabled ?? true);
  const [headline, setHeadline] = useState(initialSettings.headline || '');
  const [description, setDescription] = useState(initialSettings.description || '');
  const [badgeText, setBadgeText] = useState(initialSettings.badge_text || '');
  const [promoCode, setPromoCode] = useState(initialSettings.promo_code || '');
  const [imageUrl, setImageUrl] = useState(initialSettings.image_url || '');
  const [buttonLabel, setButtonLabel] = useState(initialSettings.button_label || '');
  const [buttonLink, setButtonLink] = useState(initialSettings.button_link || '');
  const [delaySeconds, setDelaySeconds] = useState(initialSettings.trigger_delay_seconds ?? 3);
  const [scrollPercent, setScrollPercent] = useState(initialSettings.trigger_scroll_percent ?? 25);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await updatePopupAdAction({
        is_enabled: isEnabled,
        headline: headline.trim(),
        description: description.trim(),
        badge_text: badgeText.trim() || undefined,
        promo_code: promoCode.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        button_label: buttonLabel.trim(),
        button_link: buttonLink.trim(),
        trigger_delay_seconds: Number(delaySeconds) || 3,
        trigger_scroll_percent: Number(scrollPercent) || 25,
      });

      setLoading(false);
      if (res.success) {
        setMsg('Pop-up ad settings updated successfully!');
      } else {
        setErrorMsg(res.error || 'Failed to update pop-up ad.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(`Server error: ${(err as Error).message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Master Toggle & Trigger Controls */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          <span>1. Modal Display Triggers &amp; Activation</span>
        </h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-stone-900 block">
                Enable Pop-up Promo Overlay on Storefront
              </span>
              <span className="text-[10px] text-stone-400">
                When active, visitors will receive this announcement either on scroll or entrance.
              </span>
            </div>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="uppercase text-stone-500 block">
                Trigger Entrance Delay (Seconds)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(parseInt(e.target.value, 10) || 3)}
                className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
              />
              <span className="text-[10px] text-stone-400">e.g. 3 seconds after page loads.</span>
            </div>

            <div className="space-y-1.5">
              <label className="uppercase text-stone-500 block">
                Trigger Scroll Depth Percentage (%)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={scrollPercent}
                onChange={(e) => setScrollPercent(parseInt(e.target.value, 10) || 25)}
                className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
              />
              <span className="text-[10px] text-stone-400">e.g. Triggers when user scrolls past 25% of page.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pop-up Creative & Voucher Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
          2. Announcement Copy &amp; Discount Voucher
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="uppercase text-stone-500 block">Headline Title *</label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Welcome to Kena Store"
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-bold font-serif"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="uppercase text-stone-500 block">Narrative Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enjoy 10% off your first curated order..."
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-sans font-light"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Pill Badge Text</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="e.g. Exclusive First Order Privilege"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Voucher Code (Optional)</label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="e.g. RELAX10"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-bold font-mono tracking-widest uppercase"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="uppercase text-stone-500 block">Header Banner Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">CTA Button Label *</label>
            <input
              type="text"
              required
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="Explore Catalog Now"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">CTA Button Link *</label>
            <input
              type="text"
              required
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              placeholder="/shop"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#121212] text-white px-8 py-4 uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving Settings...' : 'Save Pop-Up Ad Settings'}
        </button>
      </div>
    </form>
  );
}
