'use client';

// ============================================================================
// ADMIN STORE SETTINGS FORM
// Allows live customization of Store Name, Tagline, Logo URL, Colors, Contact
// ============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/types';
import { updateStoreSettingsAction } from '@/app/actions/settings';
import { Check, Sliders, Palette, ImageIcon, AlertCircle } from 'lucide-react';

interface StoreSettingsFormProps {
  settings: StoreSettings;
}

export function StoreSettingsForm({ settings }: StoreSettingsFormProps) {
  const [storeName, setStoreName] = useState(settings.store_name || 'Kena Store');
  const [tagline, setTagline] = useState(settings.tagline || 'Order & Relax');
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '/logo.png');
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color || '#121212');
  const [accentColor, setAccentColor] = useState(settings.accent_color || '#E51E25');
  const [backgroundColor, setBackgroundColor] = useState(settings.background_color || '#FAF9F6');
  const [contactPhone, setContactPhone] = useState(settings.contact_phone || '');
  const [contactEmail, setContactEmail] = useState(settings.contact_email || '');
  const [contactAddress, setContactAddress] = useState(settings.contact_address || '');
  const [telegramToken, setTelegramToken] = useState(settings.telegram_bot_token || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegram_chat_id || '');
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegram_notifications_enabled);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await updateStoreSettingsAction({
        store_name: storeName.trim(),
        tagline: tagline.trim(),
        logo_url: logoUrl.trim(),
        primary_color: primaryColor.trim(),
        accent_color: accentColor.trim(),
        background_color: backgroundColor.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        contact_address: contactAddress.trim(),
        telegram_bot_token: telegramToken.trim() || undefined,
        telegram_chat_id: telegramChatId.trim() || undefined,
        telegram_notifications_enabled: telegramEnabled,
      });

      setLoading(false);
      if (res.success) {
        setMsg('Store settings, logo and color branding updated successfully!');
      } else {
        setErrorMsg(res.error || 'Failed to update store settings.');
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

      {/* 1. Brand Identity & Logo */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>1. Brand Identity &amp; Logo</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Store Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Kena Store"
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-bold font-sans"
            />
            <span className="text-[10px] text-stone-400">
              Reflected immediately across header, footer, page titles, and receipts.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Brand Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Order & Relax"
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-sans font-light"
            />
            <span className="text-[10px] text-stone-400">
              e.g. &quot;Order &amp; Relax&quot; or curated fashion description.
            </span>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="uppercase text-stone-500 block">Store Logo URL / Path</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/logo.png"
                className="w-full sm:flex-1 border border-stone-300 p-3 bg-[#FAF9F6] text-sm"
              />

              {/* Logo Preview */}
              <div className="border border-stone-200 bg-stone-50 p-2 rounded flex items-center gap-3">
                <span className="text-[10px] uppercase text-stone-400">Preview:</span>
                {logoUrl ? (
                  <div className="h-10 w-28 relative bg-white px-2 py-1 rounded border border-stone-100 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Logo preview"
                      width={100}
                      height={36}
                      className="object-contain max-h-8 w-auto"
                      onError={() => {}}
                    />
                  </div>
                ) : (
                  <span className="text-[10px] text-stone-400 italic">No logo selected</span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-stone-400 block">
              Default: <code className="text-stone-700">/logo.png</code> (Kena Store: Order &amp; Relax).
            </span>
          </div>
        </div>
      </div>

      {/* 2. Color Palette & Theming */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span>2. Color Palette &amp; Brand Styling</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Primary Color */}
          <div className="space-y-2">
            <label className="uppercase text-stone-500 block">Primary Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 border border-stone-300 rounded cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono uppercase"
              />
            </div>
            <span className="text-[10px] text-stone-400">Headers, heavy text, main buttons.</span>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <label className="uppercase text-stone-500 block">Brand Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 border border-stone-300 rounded cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono uppercase font-bold"
              />
            </div>
            <span className="text-[10px] text-stone-400">
              Matches Kena Store red (<code className="text-rose-600">#E51E25</code>), highlights, sale tags.
            </span>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="uppercase text-stone-500 block">Base Background</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 border border-stone-300 rounded cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono uppercase"
              />
            </div>
            <span className="text-[10px] text-stone-400">Storefront warm canvas.</span>
          </div>
        </div>

        {/* Quick Swatches */}
        <div className="pt-2 flex items-center gap-2">
          <span className="text-[10px] text-stone-500 uppercase">Preset Accent:</span>
          <button
            type="button"
            onClick={() => setAccentColor('#E51E25')}
            className="px-2.5 py-1 text-[10px] bg-red-600 text-white rounded font-bold hover:opacity-90"
          >
            Kena Store Red (#E51E25)
          </button>
          <button
            type="button"
            onClick={() => setAccentColor('#78716C')}
            className="px-2.5 py-1 text-[10px] bg-stone-500 text-white rounded font-bold hover:opacity-90"
          >
            Classic Warm Stone (#78716C)
          </button>
          <button
            type="button"
            onClick={() => setAccentColor('#B45309')}
            className="px-2.5 py-1 text-[10px] bg-amber-700 text-white rounded font-bold hover:opacity-90"
          >
            Ethiopian Amber (#B45309)
          </button>
        </div>
      </div>

      {/* 3. Contact & Concierge Information */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          3. Concierge &amp; Physical Location Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Contact Phone *</label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Concierge Email *</label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Addis Ababa Address *</label>
            <input
              type="text"
              required
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-sans"
            />
          </div>
        </div>
      </div>

      {/* 4. Telegram Notifications Integration */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          4. Telegram Operational Bot Integration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Telegram Bot Token</label>
            <input
              type="text"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              placeholder="e.g. 123456:ABC-DEF..."
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Destination Chat / Channel ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="e.g. -100123456789"
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={telegramEnabled}
            onChange={(e) => setTelegramEnabled(e.target.checked)}
            className="rounded border-stone-300"
          />
          <span className="font-semibold text-stone-900">
            Enable Real-Time Telegram Order &amp; Winner Alerts
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#121212] text-white px-8 py-4 uppercase tracking-widest font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving Changes...' : 'Save Brand Settings & Colors'}
      </button>
    </form>
  );
}
