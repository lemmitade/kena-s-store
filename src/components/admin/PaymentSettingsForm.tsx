'use client';

// ============================================================================
// ADMIN PAYMENT SETTINGS FORM
// Chapa keys configuration, Cash on Delivery toggle, webhook signature setup
// ============================================================================

import React, { useState } from 'react';
import { StoreSettings } from '@/types';
import { updateStoreSettingsAction } from '@/app/actions/settings';
import { Check, ShieldCheck, AlertCircle } from 'lucide-react';

interface PaymentSettingsFormProps {
  settings: StoreSettings;
}

export function PaymentSettingsForm({ settings }: PaymentSettingsFormProps) {
  const [codEnabled, setCodEnabled] = useState(settings.cod_enabled);
  const [chapaEnabled, setChapaEnabled] = useState(settings.chapa_enabled);
  const [chapaPublicKey, setChapaPublicKey] = useState(settings.chapa_public_key || '');
  const [chapaSecretKey, setChapaSecretKey] = useState(settings.chapa_secret_key || '');
  const [chapaWebhookSecret, setChapaWebhookSecret] = useState(settings.chapa_webhook_secret || '');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const res = await updateStoreSettingsAction({
      cod_enabled: codEnabled,
      chapa_enabled: chapaEnabled,
      chapa_public_key: chapaPublicKey.trim() || undefined,
      chapa_secret_key: chapaSecretKey.trim() || undefined,
      chapa_webhook_secret: chapaWebhookSecret.trim() || undefined,
    });

    setLoading(false);
    if (res.success) {
      setMsg('Payment settings updated successfully!');
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

      {/* Cash on Delivery (COD) */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          1. Cash on Delivery (COD) / Pickup Collection
        </h2>
        <p className="text-stone-500">
          Allows customers in supported delivery zones to pay our courier upon delivery or collect in store.
        </p>

        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={codEnabled}
            onChange={(e) => setCodEnabled(e.target.checked)}
            className="rounded border-stone-300 text-stone-900 focus:ring-0"
          />
          <span className="font-semibold text-stone-900">
            Accept Cash on Delivery (Active)
          </span>
        </label>
      </div>

      {/* Chapa Payment Gateway */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
            2. Chapa Payment Gateway (Telebirr, CBE Birr, Debit/Credit Cards)
          </h2>
          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-bold">
            Currency: ETB
          </span>
        </div>

        <div className="p-4 bg-stone-50 border border-stone-200 text-stone-600 text-xs flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-stone-800 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-900 block">Security Guideline</span>
            <p className="font-light">
              Do not enable live online payments until your Chapa merchant account is approved, verified, and test transactions have succeeded. All webhooks are validated with HMAC SHA256 signatures.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={chapaEnabled}
            onChange={(e) => setChapaEnabled(e.target.checked)}
            className="rounded border-stone-300 text-stone-900 focus:ring-0"
          />
          <span className="font-semibold text-stone-900">
            Enable Chapa Online Payments at Checkout
          </span>
        </label>

        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Chapa Public Key (Client)</label>
            <input
              type="text"
              value={chapaPublicKey}
              onChange={(e) => setChapaPublicKey(e.target.value)}
              placeholder="CHAPUBK_TEST-..."
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Chapa Secret Key (Server-Only)</label>
            <input
              type="password"
              value={chapaSecretKey}
              onChange={(e) => setChapaSecretKey(e.target.value)}
              placeholder="CHASECK_TEST-..."
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Chapa Webhook Secret (HMAC)</label>
            <input
              type="password"
              value={chapaWebhookSecret}
              onChange={(e) => setChapaWebhookSecret(e.target.value)}
              placeholder="Webhook secret for signature verification"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
            <span className="text-[10px] text-stone-400 block pt-0.5">
              Webhook URL for your Chapa dashboard: <code>https://yourdomain.com/api/webhooks/chapa</code>
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#121212] text-white px-8 py-4 uppercase tracking-widest font-semibold hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Payment Configuration'}
      </button>
    </form>
  );
}
