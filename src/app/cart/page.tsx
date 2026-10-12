'use client';

// ============================================================================
// SHOPPING CART PAGE: /cart
// Real-time quantities, stock cap check, coupon validation, item removal
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart/cart-context';
import { formatETB } from '@/lib/utils/format';
import { Trash2, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotalETB,
    appliedCoupon,
    couponDiscountETB,
    applyCouponCode,
    removeCouponCode,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);

    const res = await applyCouponCode(couponInput.trim());
    setCouponLoading(false);

    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
  };

  const finalSubtotal = Math.max(0, subtotalETB - couponDiscountETB);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      {/* Editorial Minimalist Header */}
      <header className="border-b border-[#E7E5E4] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="font-serif tracking-widest text-xl font-bold uppercase text-[#121212]">
            YOUR BRAND
          </Link>
          <Link
            href="/shop"
            className="text-xs uppercase font-mono tracking-wider text-stone-600 hover:text-black flex items-center gap-1"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl sm:text-4xl font-serif font-light mb-8">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center bg-white border border-[#E7E5E4] p-12 max-w-xl mx-auto space-y-5">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h2 className="text-2xl font-serif">Your shopping bag is empty</h2>
            <p className="text-xs font-mono text-stone-500">
              Pieces added to your bag will be held while you browse our collections.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#121212] text-white px-8 py-4 text-xs font-mono uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
              Discover The Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* 1. BAG ITEMS LIST (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="border-b border-stone-200 pb-3 hidden sm:grid grid-cols-12 text-[11px] font-mono tracking-wider uppercase text-stone-400">
                <span className="col-span-6">Piece</span>
                <span className="col-span-3 text-center">Quantity</span>
                <span className="col-span-3 text-right">Total</span>
              </div>

              {items.map((item) => (
                <div
                  key={item.variant_id}
                  className="bg-white border border-[#E7E5E4] p-5 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center"
                >
                  {/* Image & Title (col 6) */}
                  <div className="sm:col-span-6 flex items-center gap-4 w-full">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-stone-100 flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 font-mono">
                          Image
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={`/product/${item.product_slug}`}
                        className="text-sm font-medium hover:underline text-[#121212] line-clamp-1"
                      >
                        {item.product_name}
                      </Link>
                      <div className="text-xs font-mono text-stone-500">
                        {item.size && <span>Size: {item.size} • </span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <div className="text-xs font-mono text-stone-400">
                        Unit: {formatETB(item.unit_price_etb)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variant_id)}
                        className="text-xs font-mono text-stone-400 hover:text-rose-600 flex items-center gap-1 pt-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity selector (col 3) */}
                  <div className="sm:col-span-3 flex sm:justify-center items-center w-full">
                    <div className="flex items-center border border-stone-300 h-10">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-stone-600 hover:text-black"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        disabled={item.quantity >= item.max_stock}
                        className="w-8 h-full flex items-center justify-center text-stone-600 hover:text-black disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Line Total (col 3) */}
                  <div className="sm:col-span-3 text-right w-full sm:w-auto font-mono text-sm font-semibold text-[#121212]">
                    {formatETB(item.unit_price_etb * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* 2. SUMMARY & COUPON PROMO (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-[#E7E5E4] p-6 space-y-6">
                <h2 className="text-lg font-serif font-medium border-b border-stone-200 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">{formatETB(subtotalETB)}</span>
                  </div>

                  {couponDiscountETB > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{formatETB(couponDiscountETB)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-500">
                    <span>Delivery / Pickup</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="border-t border-stone-200 pt-3 flex justify-between text-sm font-bold text-[#121212]">
                    <span>Estimated Total</span>
                    <span>{formatETB(finalSubtotal)}</span>
                  </div>
                </div>

                {/* Coupon Application Box */}
                <div className="border-t border-stone-200 pt-5">
                  {appliedCoupon ? (
                    <div className="bg-stone-50 border border-stone-200 p-3 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-stone-800">
                        <Tag className="w-3.5 h-3.5 text-stone-600" />
                        <span>
                          Code: <strong>{appliedCoupon.code}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCouponCode}
                        className="text-stone-400 hover:text-rose-600 underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 block">
                        Promotional Code / Voucher
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="e.g. WELCOME10"
                          className="w-full bg-[#FAF9F6] border border-stone-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-stone-900 uppercase"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading}
                          className="bg-stone-900 text-white px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-black disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>

                      {couponMessage && (
                        <p
                          className={`text-xs font-mono flex items-center gap-1.5 ${
                            couponMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {couponMessage.type === 'success' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{couponMessage.text}</span>
                        </p>
                      )}
                    </form>
                  )}
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full bg-[#121212] text-[#FAF9F6] h-14 uppercase tracking-widest text-xs font-semibold font-mono flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[11px] font-mono text-center text-stone-400">
                  Guest checkout supported • No mandatory registration required
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
