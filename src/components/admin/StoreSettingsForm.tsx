'use client';

// ============================================================================
// ADMIN STORE SETTINGS FORM
// Allows live customization of Store Name, Tagline, Logo, Colors, Contact
// ============================================================================

import React, { useState } from 'react';
import { StoreSettings } from '@/types';
import { updateStoreSettingsAction } from '@/app/actions/settings';
import { Check, Sliders } from 'lucide-react';

interface StoreSettingsFormProps {
  settings: StoreSettings;
}

export function StoreSettingsForm({ settings }: StoreSettingsFormProps) {
  const [storeName, setStoreName] = useState(settings.store_name);
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [contactPhone, setContactPhone] = useState(settings.contact_phone || '');
  const [contactEmail, setContactEmail] = useState(settings.contact_email || '');
  const [contactAddress, setContactAddress] = useState(settings.contact_address || '');
  const [telegramToken, setTelegramToken] = useState(settings.telegram_bot_token || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegram_chat_id || '');
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegram_notifications_enabled);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const res = await updateStoreSettingsAction({
      store_name: storeName.trim(),
      tagline: tagline.trim(),
      contact_phone: contactPhone.trim(),
      contact_email: contactEmail.trim(),
      contact_address: contactAddress.trim(),
      telegram_bot_token: telegramToken.trim() || undefined,
      telegram_chat_id: telegramChatId.trim() || undefined,
      telegram_notifications_enabled: telegramEnabled,
    });

    setLoading(false);
    if (res.success) {
      setMsg('Store settings saved successfully! Live brand name and details updated.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Brand Identity */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Brand Name &amp; Editorial Positioning
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Store Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="YOUR BRAND"
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
              placeholder="Curated Ethiopian Fashion & Modern Essentials"
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-sans font-light"
            />
          </div>
        </div>
      </div>

      {/* Contact & Concierge Information */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Concierge &amp; Physical Location Details
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

      {/* Telegram Notifications Integration */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Telegram Operational Bot Integration
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
        className="bg-[#121212] text-white px-8 py-4 uppercase tracking-widest font-semibold hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? 'Saving Changes...' : 'Save Brand Settings'}
      </button>
    </form>
  );
}
