'use client';

// ============================================================================
// ADMIN SEO MANAGER FORM WITH LIVE SEARCH & SOCIAL PREVIEW
// ============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { SeoSettings } from '@/types';
import { updateSeoSettingsAction } from '@/app/actions/seo';
import { Check, AlertCircle, Search, Share2, Globe, Eye, Sparkles } from 'lucide-react';

interface SeoManagerFormProps {
  initialSeo: SeoSettings;
  storeName: string;
}

export function SeoManagerForm({ initialSeo, storeName }: SeoManagerFormProps) {
  const [metaTitle, setMetaTitle] = useState(initialSeo.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialSeo.meta_description || '');
  const [keywords, setKeywords] = useState(initialSeo.keywords || '');
  const [ogImageUrl, setOgImageUrl] = useState(initialSeo.og_image_url || '/logo.png');
  const [canonicalUrl, setCanonicalUrl] = useState(initialSeo.canonical_url || 'https://kenasstore.com');
  const [twitterHandle, setTwitterHandle] = useState(initialSeo.twitter_handle || '@kenastore');
  const [allowIndexing, setAllowIndexing] = useState(initialSeo.allow_indexing ?? true);
  const [googleVerification, setGoogleVerification] = useState(
    initialSeo.google_site_verification || ''
  );

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await updateSeoSettingsAction({
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        keywords: keywords.trim(),
        og_image_url: ogImageUrl.trim(),
        canonical_url: canonicalUrl.trim(),
        twitter_handle: twitterHandle.trim(),
        allow_indexing: allowIndexing,
        google_site_verification: googleVerification.trim(),
      });

      setLoading(false);
      if (res.success) {
        setMsg('SEO metadata and social sharing tags updated successfully across storefront!');
      } else {
        setErrorMsg(res.error || 'Failed to update SEO settings.');
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

      {/* 1. LIVE PREVIEWS CARD */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-stone-700" />
          <span>Live Search Engine &amp; Social Card Preview</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Google Preview */}
          <div className="bg-stone-50 border border-stone-200 p-5 rounded space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1.5">
              <Search className="w-3 h-3 text-blue-600" />
              <span>Google Desktop Search Preview</span>
            </span>

            <div className="bg-white p-4 border border-stone-200 rounded font-sans space-y-1">
              <div className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                <Globe className="w-3 h-3 text-stone-400" />
                <span>{canonicalUrl || 'https://kenastore.et'}</span>
              </div>
              <h3 className="text-base text-[#1a0dab] font-medium hover:underline truncate cursor-pointer">
                {metaTitle || 'Kena Store | Curated Ethiopian Fashion & Modern Essentials'}
              </h3>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {metaDescription ||
                  'Curated Ethiopian luxury fashion, handcrafted highland leather bags, linen garments, and Shemma heritage essentials. Order & relax.'}
              </p>
            </div>
          </div>

          {/* Social Share Card Preview */}
          <div className="bg-stone-50 border border-stone-200 p-5 rounded space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3 h-3 text-rose-600" />
              <span>Social Share (OpenGraph / Telegram / Twitter)</span>
            </span>

            <div className="bg-white border border-stone-200 rounded overflow-hidden font-sans">
              <div className="h-32 bg-stone-100 relative flex items-center justify-center overflow-hidden">
                {ogImageUrl ? (
                  <Image
                    src={ogImageUrl}
                    alt="Social preview"
                    fill
                    sizes="300px"
                    className="object-contain p-4"
                    onError={() => {}}
                  />
                ) : (
                  <span className="text-xs text-stone-400">No Image Specified</span>
                )}
              </div>
              <div className="p-3 border-t border-stone-100 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                  {new URL(canonicalUrl || 'https://kenastore.et').hostname}
                </span>
                <h4 className="text-xs font-bold text-stone-900 truncate">
                  {metaTitle || 'Kena Store'}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-2 leading-snug">
                  {metaDescription || 'Curated Ethiopian Fashion'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE SEO METADATA SETTINGS */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
          Core Meta Tags &amp; Canonical URL
        </h2>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="uppercase text-stone-500 block">SEO Meta Title *</label>
              <span className={`text-[10px] ${metaTitle.length > 60 ? 'text-amber-600' : 'text-stone-400'}`}>
                {metaTitle.length} / 60 characters recommended
              </span>
            </div>
            <input
              type="text"
              required
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Kena Store | Curated Ethiopian Fashion & Modern Essentials"
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-sm font-bold font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="uppercase text-stone-500 block">SEO Meta Description *</label>
              <span className={`text-[10px] ${metaDescription.length > 160 ? 'text-amber-600' : 'text-stone-400'}`}>
                {metaDescription.length} / 160 characters recommended
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Understated luxury tailored in Addis Ababa..."
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-sans leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="uppercase text-stone-500 block">Target Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ethiopian fashion, linen clothes, Addis Ababa shopping, leather bags"
                className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
              />
              <span className="text-[10px] text-stone-400">Comma-separated keywords.</span>
            </div>

            <div className="space-y-1.5">
              <label className="uppercase text-stone-500 block">Canonical Store URL *</label>
              <input
                type="url"
                required
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://kenastore.et"
                className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
              />
              <span className="text-[10px] text-stone-400">Primary domain canonical link.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SOCIAL MEDIA & OPEN GRAPH ASSETS */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
          Social Sharing (OpenGraph &amp; Twitter Cards)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">OpenGraph Banner Image URL</label>
            <input
              type="text"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              placeholder="/logo.png or https://images.unsplash.com/..."
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
            />
            <span className="text-[10px] text-stone-400">
              Default image shown when links are shared on Telegram, WhatsApp, Facebook.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Twitter / X Handle</label>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="@kenastore"
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. ROBOTS & SEARCH CONSOLE VERIFICATION */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
          Robots Indexing &amp; Webmaster Verification
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">
              Google Search Console Verification Token (Optional)
            </label>
            <input
              type="text"
              value={googleVerification}
              onChange={(e) => setGoogleVerification(e.target.value)}
              placeholder="e.g. google-site-verification=abc123xyz..."
              className="w-full border border-stone-300 p-3 bg-[#FAF9F6] text-xs font-mono"
            />
            <span className="text-[10px] text-stone-400">
              Injected directly into &lt;meta name=&quot;google-site-verification&quot;&gt;.
            </span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={allowIndexing}
              onChange={(e) => setAllowIndexing(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0"
            />
            <div>
              <span className="font-semibold text-stone-900 block">
                Allow Search Engines to Index Site (robots: index, follow)
              </span>
              <span className="text-[10px] text-stone-400">
                Uncheck to hide site from search engines during maintenance or staging.
              </span>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#121212] text-white px-8 py-4 uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving SEO Configuration...' : 'Save SEO & Meta Tags'}
      </button>
    </form>
  );
}
