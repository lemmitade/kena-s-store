'use client';

// ============================================================================
// EDITORIAL PRODUCT CARD
// Clean minimalist presentation, ETB pricing, stock status, subtle transitions
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatETB } from '@/lib/utils/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const secondaryImage = product.images?.[1];

  // Calculate total stock across variants
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isSoldOut = totalStock <= 0;
  const isLowStock = !isSoldOut && totalStock <= product.low_stock_threshold;

  return (
    <div className="group relative flex flex-col">
      {/* Product Image Frame */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 block"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
              secondaryImage ? 'group-hover:opacity-0' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 font-mono text-xs">
            No Image
          </div>
        )}

        {secondaryImage && (
          <Image
            src={secondaryImage.image_url}
            alt={secondaryImage.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new_arrival && (
            <span className="bg-[#121212] text-[#FAF9F6] text-[10px] font-mono tracking-widest uppercase px-2 py-0.5">
              New
            </span>
          )}
          {product.sale_price_etb && (
            <span className="bg-stone-200 text-[#121212] text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 font-bold">
              Sale
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {isSoldOut ? (
          <div className="absolute inset-0 bg-[#121212]/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white text-black text-xs uppercase tracking-widest font-mono font-bold px-3 py-1">
              Sold Out
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] font-mono tracking-wider px-2 py-0.5">
            Only {totalStock} remaining
          </span>
        ) : null}
      </Link>

      {/* Product Information */}
      <div className="pt-4 flex flex-col space-y-1">
        {product.section && (
          <span className="text-[11px] font-mono tracking-widest uppercase text-stone-400">
            {product.section.name} {product.category ? `• ${product.category.name}` : ''}
          </span>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-medium text-[#121212] hover:underline underline-offset-4 line-clamp-1"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2 pt-0.5 text-sm font-mono">
          {product.sale_price_etb ? (
            <>
              <span className="text-[#121212] font-semibold">
                {formatETB(product.sale_price_etb)}
              </span>
              <span className="text-stone-400 line-through text-xs">
                {formatETB(product.regular_price_etb)}
              </span>
            </>
          ) : (
            <span className="text-[#121212]">{formatETB(product.regular_price_etb)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
