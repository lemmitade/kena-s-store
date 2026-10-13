'use client';

// ============================================================================
// ADMIN HERO CAROUSEL EDITOR FORM
// Supports image and video media URLs, multi-slide ordering, editorial copy
// ============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { HeroSlide } from '@/types';
import { updateHeroSlidesAction } from '@/app/actions/content';
import {
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface HeroEditorFormProps {
  initialSlides: HeroSlide[];
}

export function HeroEditorForm({ initialSlides }: HeroEditorFormProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      tag: 'New Editorial Drop',
      title: 'Artisanal Elegance.\nHandcrafted in Ethiopia.',
      description: 'Discover new season tailoring and luxury leather essentials.',
      media_type: 'image',
      media_url:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=2000&q=85',
      cta_primary_label: 'Shop Collection',
      cta_primary_link: '/shop',
      cta_secondary_label: 'Explore Story',
      cta_secondary_link: '/about',
      is_active: true,
      display_order: slides.length + 1,
    };
    setSlides([...slides, newSlide]);
  };

  const handleRemoveSlide = (id: string) => {
    if (slides.length <= 1) {
      setErrorMsg('You must retain at least one hero slide.');
      return;
    }
    setSlides(slides.filter((s) => s.id !== id));
  };

  const handleSlideChange = (id: string, field: keyof HeroSlide, value: any) => {
    setSlides(
      slides.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);
    setSlides(newSlides);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await updateHeroSlidesAction(slides);
      setLoading(false);
      if (res.success) {
        setMsg('Hero carousel slides and video links saved successfully!');
      } else {
        setErrorMsg(res.error || 'Failed to update hero slides.');
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

      {/* Top action header */}
      <div className="flex items-center justify-between bg-white border border-[#E7E5E4] p-4">
        <div>
          <span className="font-bold text-stone-900 uppercase">
            Active Slides ({slides.length})
          </span>
          <p className="text-[11px] text-stone-500">
            Supports MP4 videos, YouTube embeds, and high-res imagery.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSlide}
          className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Slide cards */}
      <div className="space-y-6">
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className="bg-white border border-[#E7E5E4] p-6 space-y-6 relative"
          >
            {/* Slide title bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <span className="bg-stone-100 text-stone-800 px-2.5 py-1 text-xs font-bold rounded">
                  Slide #{idx + 1}
                </span>
                <span className="font-semibold text-stone-900 truncate max-w-xs font-sans">
                  {slide.tag || 'Slide Item'}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                    slide.media_type === 'video'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {slide.media_type}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveSlide(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-stone-500 hover:text-black disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(idx, 'down')}
                  disabled={idx === slides.length - 1}
                  className="p-1 text-stone-500 hover:text-black disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(slide.id)}
                  className="p-1 text-stone-400 hover:text-rose-600 transition-colors ml-2"
                  title="Delete Slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="uppercase text-stone-500 block">Collection / Tag *</label>
                <input
                  type="text"
                  required
                  value={slide.tag}
                  onChange={(e) => handleSlideChange(slide.id, 'tag', e.target.value)}
                  placeholder="e.g. Autumn / Winter 2026 Collection"
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="uppercase text-stone-500 block">Media Type *</label>
                <select
                  value={slide.media_type}
                  onChange={(e) =>
                    handleSlideChange(slide.id, 'media_type', e.target.value as 'image' | 'video')
                  }
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
                >
                  <option value="image">Still Photography (Image)</option>
                  <option value="video">Motion Showcase (Video URL / YouTube)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="uppercase text-stone-500 block">
                  {slide.media_type === 'video'
                    ? 'Video Media URL (Direct MP4 or YouTube Link) *'
                    : 'Image Media URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={slide.media_url}
                  onChange={(e) => handleSlideChange(slide.id, 'media_url', e.target.value)}
                  placeholder={
                    slide.media_type === 'video'
                      ? 'https://.../video.mp4 or https://youtube.com/watch?v=...'
                      : 'https://images.unsplash.com/...'
                  }
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
                />
                <span className="text-[10px] text-stone-400 block">
                  {slide.media_type === 'video'
                    ? 'Supports .mp4, .webm direct links, or standard YouTube links (e.g. https://www.youtube.com/watch?v=...).'
                    : 'High-resolution photography URL.'}
                </span>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="uppercase text-stone-500 block">Main Headline Title *</label>
                <textarea
                  rows={2}
                  required
                  value={slide.title}
                  onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                  placeholder="Quiet Tailoring.\nArtisanal Roots."
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-sm font-serif font-bold"
                />
                <span className="text-[10px] text-stone-400">
                  New lines create a dramatic editorial line break.
                </span>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="uppercase text-stone-500 block">Editorial Narrative Description *</label>
                <textarea
                  rows={2}
                  required
                  value={slide.description}
                  onChange={(e) => handleSlideChange(slide.id, 'description', e.target.value)}
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-sans font-light"
                />
              </div>

              {/* CTA Primary */}
              <div className="space-y-1.5">
                <label className="uppercase text-stone-500 block">Primary Button Label *</label>
                <input
                  type="text"
                  required
                  value={slide.cta_primary_label}
                  onChange={(e) => handleSlideChange(slide.id, 'cta_primary_label', e.target.value)}
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="uppercase text-stone-500 block">Primary Button Link *</label>
                <input
                  type="text"
                  required
                  value={slide.cta_primary_link}
                  onChange={(e) => handleSlideChange(slide.id, 'cta_primary_link', e.target.value)}
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
                />
              </div>

              {/* CTA Secondary */}
              <div className="space-y-1.5">
                <label className="uppercase text-stone-500 block">Secondary Button Label (Optional)</label>
                <input
                  type="text"
                  value={slide.cta_secondary_label || ''}
                  onChange={(e) => handleSlideChange(slide.id, 'cta_secondary_label', e.target.value)}
                  placeholder="Leave blank for single button"
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="uppercase text-stone-500 block">Secondary Button Link (Optional)</label>
                <input
                  type="text"
                  value={slide.cta_secondary_link || ''}
                  onChange={(e) => handleSlideChange(slide.id, 'cta_secondary_link', e.target.value)}
                  placeholder="/bids"
                  className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slide.is_active}
                  onChange={(e) => handleSlideChange(slide.id, 'is_active', e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span className="font-semibold text-stone-800">Slide is Active on Homepage</span>
              </label>

              <a
                href={slide.media_url}
                target="_blank"
                rel="noreferrer"
                className="text-stone-500 hover:text-black inline-flex items-center gap-1 text-[11px]"
              >
                <span>Inspect Media Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#121212] text-white px-8 py-4 uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving Carousel Slides...' : 'Save Hero Carousel Slides'}
        </button>
      </div>
    </form>
  );
}
