'use client';

// ============================================================================
// PRODUCT DETAIL VIEW: INTERACTIVE VARIANT MATRIX & CART ADDITION
// Size selector, color picker, stock tracker, gallery thumbnail switcher
// ============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/types';
import { formatETB } from '@/lib/utils/format';
import { useCart } from '@/lib/cart/cart-context';
import { Check, ShoppingBag, ShieldCheck, Truck, Store } from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const variants = product.variants || [];

  // Active gallery image
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : [];

  // Group unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];

  // Selected variant state
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Find the exact variant matching selected size & color
  const currentVariant: ProductVariant | undefined = variants.find((v) => {
    const sizeMatch = !selectedSize || v.size === selectedSize;
    const colorMatch = !selectedColor || v.color === selectedColor;
    return sizeMatch && colorMatch;
  });

  const isAvailable = currentVariant && currentVariant.is_available && currentVariant.stock_quantity > 0;
  const currentStock = currentVariant?.stock_quantity ?? 0;

  const currentPrice =
    currentVariant?.price_override_etb ||
    product.sale_price_etb ||
    product.regular_price_etb;

  const handleAddToCart = () => {
    if (!currentVariant || !isAvailable) return;

    addItem({
      variant_id: currentVariant.id,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      sku: currentVariant.sku,
      size: currentVariant.size,
      color: currentVariant.color,
      unit_price_etb: currentPrice,
      quantity,
      image_url: images[0]?.image_url,
      max_stock: currentStock,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      {/* 1. PRODUCT GALLERY (LEFT COLUMN) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main active image */}
        <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
          {images[activeImageIndex] ? (
            <Image
              src={images[activeImageIndex].image_url}
              alt={images[activeImageIndex].alt_text || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 font-mono text-sm">
              No Image Available
            </div>
          )}

          {product.sale_price_etb && (
            <span className="absolute top-4 left-4 bg-stone-900 text-white text-[11px] font-mono tracking-widest uppercase px-2.5 py-1 font-semibold">
              Sale
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 aspect-[3/4] flex-shrink-0 border-2 overflow-hidden transition-all ${
                  activeImageIndex === idx ? 'border-stone-900' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. PRODUCT DETAILS & BUYING ACTION (RIGHT COLUMN) */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-8">
        <div>
          {product.section && (
            <span className="text-xs font-mono tracking-widest uppercase text-stone-500">
              {product.section.name} {product.category ? `• ${product.category.name}` : ''}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl font-serif font-normal text-[#121212] mt-1 leading-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex items-baseline gap-3">
            {product.sale_price_etb ? (
              <>
                <span className="text-2xl font-mono font-semibold text-[#121212]">
                  {formatETB(product.sale_price_etb)}
                </span>
                <span className="text-stone-400 line-through text-base font-mono">
                  {formatETB(product.regular_price_etb)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-mono font-normal text-[#121212]">
                {formatETB(product.regular_price_etb)}
              </span>
            )}
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
              VAT Inclusive
            </span>
          </div>
        </div>

        <div className="border-t border-[#E7E5E4] pt-6 space-y-6">
          {/* Color Selector */}
          {colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono tracking-wider uppercase mb-2.5">
                <span className="text-stone-500">Color:</span>
                <span className="text-stone-900 font-semibold">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const variantForColor = variants.find((v) => v.color === color);
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-mono border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-300 hover:border-stone-500 text-stone-800'
                      }`}
                    >
                      {variantForColor?.color_hex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: variantForColor.color_hex }}
                        />
                      )}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono tracking-wider uppercase mb-2.5">
                <span className="text-stone-500">Size / Fit:</span>
                <span className="text-stone-900 font-semibold">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const variantForSize = variants.find(
                    (v) => v.size === size && (!selectedColor || v.color === selectedColor)
                  );
                  const inStock = variantForSize && variantForSize.stock_quantity > 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!inStock}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-3 text-xs font-mono border transition-all ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : inStock
                          ? 'border-stone-300 hover:border-stone-900 text-stone-800'
                          : 'border-stone-200 text-stone-300 line-through cursor-not-allowed bg-stone-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SKU & Real Stock Feedback */}
          <div className="text-xs font-mono text-stone-500 flex items-center justify-between pt-1">
            <span>SKU: {currentVariant?.sku || 'N/A'}</span>
            {isAvailable ? (
              <span className="text-stone-800">
                {currentStock <= product.low_stock_threshold ? (
                  <span className="text-amber-700 font-semibold">
                    Low Stock: {currentStock} units remaining
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">In Stock ({currentStock})</span>
                )}
              </span>
            ) : (
              <span className="text-rose-600 font-medium">Currently Unavailable</span>
            )}
          </div>

          {/* Quantity Selector & Add To Cart Button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {isAvailable && (
                <div className="flex items-center border border-stone-300 h-14">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-full flex items-center justify-center text-stone-600 hover:text-black disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock}
                    className="w-10 h-full flex items-center justify-center text-stone-600 hover:text-black disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex-1 h-14 uppercase tracking-widest text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all ${
                  isAvailable
                    ? 'bg-[#121212] text-[#FAF9F6] hover:bg-stone-800'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAvailable ? 'Add To Bag' : 'Sold Out'}</span>
              </button>
            </div>

            {addedToast && (
              <div className="p-3 bg-stone-900 text-white text-xs font-mono flex items-center justify-between animate-in fade-in duration-200">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Added to shopping bag.
                </span>
                <a href="/cart" className="underline underline-offset-2 hover:text-stone-300">
                  View Bag →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Editorial Description & Material Notes */}
        <div className="border-t border-[#E7E5E4] pt-6 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-stone-900 font-semibold">
            Product Narrative &amp; Craft
          </h3>
          <p className="text-stone-600 text-sm leading-relaxed font-light whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Fulfillment & Authenticity Guarantees */}
        <div className="border-t border-[#E7E5E4] pt-6 space-y-3 text-xs font-mono text-stone-600">
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-stone-900 flex-shrink-0" />
            <span>Fast Addis Ababa delivery (24-48h) or Regional Ethiopian Express</span>
          </div>
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-stone-900 flex-shrink-0" />
            <span>Complimentary pickup at Bole Flagship, Kazanchis, or Sarbet</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-stone-900 flex-shrink-0" />
            <span>Hand-finished by verified master artisans in Ethiopia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
