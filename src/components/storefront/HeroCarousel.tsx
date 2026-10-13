'use client';

// ============================================================================
// STOREFRONT HERO CAROUSEL (IMAGES & VIDEO SUPPORT)
// Supports cross-slide animation, HTML5 & YouTube videos, editorial typography
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide, Competition } from '@/types';
import { ArrowRight, ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';

interface HeroCarouselProps {
  slides: HeroSlide[];
  activeCompetition?: Competition;
}

export function HeroCarousel({ slides, activeCompetition }: HeroCarouselProps) {
  const activeSlides = slides.filter((s) => s.is_active);
  const displaySlides = activeSlides.length > 0 ? activeSlides : slides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Auto-advance every 7 seconds when not paused
  useEffect(() => {
    if (displaySlides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [displaySlides.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];

  // Helper to extract YouTube video ID if given a youtube link
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1`;
      }
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const isYouTube = currentSlide?.media_type === 'video' && (currentSlide.media_url.includes('youtube.com') || currentSlide.media_url.includes('youtu.be'));
  const youTubeUrl = isYouTube ? getYouTubeEmbedUrl(currentSlide.media_url) : null;

  return (
    <section
      className="relative h-[85vh] min-h-[600px] w-full bg-stone-900 overflow-hidden flex items-end select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Media Layers */}
      {displaySlides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        const isVid = slide.media_type === 'video';
        const yt = isVid ? getYouTubeEmbedUrl(slide.media_url) : null;

        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            {isVid ? (
              yt ? (
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none scale-125">
                  <iframe
                    src={yt}
                    title={slide.title}
                    className="w-full h-full object-cover pointer-events-none"
                    allow="autoplay; encrypted-media"
                    tabIndex={-1}
                  />
                </div>
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  src={slide.media_url}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <Image
                src={slide.media_url}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover object-top opacity-85 scale-105 transition-transform duration-1000 ease-out"
                sizes="100vw"
              />
            )}
          </div>
        );
      })}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-[1] pointer-events-none" />

      {/* Main Slide Editorial Text Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 w-full">
        <div className="max-w-2xl space-y-6 animate-in fade-in duration-700">
          <span className="inline-block text-xs uppercase tracking-[0.3em] font-mono text-stone-300">
            {currentSlide.tag || 'Autumn / Winter 2026 Collection'}
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light text-[#FAF9F6] leading-[1.08] tracking-tight whitespace-pre-line">
            {currentSlide.title}
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg font-light">
            {currentSlide.description}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              href={currentSlide.cta_primary_link || '/shop'}
              className="bg-[#FAF9F6] text-[#121212] px-8 py-4 text-xs tracking-widest uppercase font-semibold hover:bg-stone-200 transition-colors inline-flex items-center gap-2 group/btn"
            >
              <span>{currentSlide.cta_primary_label || 'Explore Catalog'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>

            {currentSlide.cta_secondary_label && (
              <Link
                href={currentSlide.cta_secondary_link || '/bids'}
                className="border border-white/60 text-white backdrop-blur-sm px-6 py-4 text-xs tracking-widest uppercase font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <span>{currentSlide.cta_secondary_label}</span>
              </Link>
            )}

            {/* Video Mute Toggle if HTML5 video is playing */}
            {currentSlide.media_type === 'video' && !isYouTube && (
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-3.5 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/70 transition-colors backdrop-blur-sm"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      {displaySlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Navigation Indicators (Dots & Slide Count) */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2.5">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Jump to slide ${i + 1}`}
            />
          ))}
          <span className="text-[11px] font-mono text-white/70 ml-2 tracking-widest">
            {currentIndex + 1} / {displaySlides.length}
          </span>
        </div>
      )}
    </section>
  );
}
