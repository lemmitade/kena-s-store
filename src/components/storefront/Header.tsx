'use client';

// ============================================================================
// STOREFRONT HEADER & NAVIGATION
// Dynamic section navigation, search modal toggle, and live cart item count
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/cart-context';
import { StoreSection, StoreSettings } from '@/types';
import { ShoppingBag, Search, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  sections: StoreSection[];
  settings: StoreSettings;
}

export function Header({ sections, settings }: HeaderProps) {
  const { totalCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E7E5E4] transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#121212] text-[#FAF9F6] text-[11px] tracking-widest uppercase font-mono py-2 px-4 text-center flex items-center justify-center gap-3">
        <span>Complimentary Delivery in Addis Ababa on Orders Over 2,500 ETB</span>
        <span className="hidden sm:inline text-stone-500">•</span>
        <span className="hidden sm:inline">Handcrafted Highland Leather &amp; Handspun Cotton</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#121212] hover:opacity-70 transition-opacity"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-2">
              <span className="font-serif tracking-widest text-xl sm:text-2xl font-bold uppercase text-[#121212] group-hover:opacity-80 transition-opacity">
                {settings.store_name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-[13px] tracking-widest uppercase font-medium">
            <Link
              href="/shop"
              className="text-[#121212] hover:text-[#78716C] transition-colors py-1 relative group"
            >
              Shop All
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#121212] transition-all duration-200 group-hover:w-full" />
            </Link>

            {sections
              .filter((s) => s.is_nav_visible)
              .map((section) => (
                <Link
                  key={section.id}
                  href={`/shop/${section.slug}`}
                  className="text-[#121212] hover:text-[#78716C] transition-colors py-1 relative group"
                >
                  {section.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#121212] transition-all duration-200 group-hover:w-full" />
                </Link>
              ))}

            <Link
              href="/bids"
              className="text-[#78716C] hover:text-[#121212] transition-colors py-1 flex items-center gap-1 font-semibold"
            >
              Competitions
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5">
            <Link
              href="/search"
              className="p-2 text-[#121212] hover:opacity-70 transition-opacity"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/track-order"
              className="hidden sm:inline-block text-[12px] tracking-wider uppercase font-medium text-[#737373] hover:text-[#121212] transition-colors"
            >
              Track Order
            </Link>

            <Link
              href="/cart"
              className="p-2 text-[#121212] hover:opacity-70 transition-opacity relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#121212] text-[#FAF9F6] text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E5E4] bg-[#FAF9F6] px-6 py-8 space-y-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4 text-sm tracking-widest uppercase font-medium">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E7E5E4] flex items-center justify-between"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </Link>

            {sections
              .filter((s) => s.is_nav_visible)
              .map((section) => (
                <Link
                  key={section.id}
                  href={`/shop/${section.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-[#E7E5E4] flex items-center justify-between"
                >
                  <span>{section.name}</span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </Link>
              ))}

            <Link
              href="/bids"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E7E5E4] text-amber-700 flex items-center justify-between font-semibold"
            >
              <span>Unique-Lowest-Bid Competitions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E7E5E4] text-stone-600 flex items-center justify-between"
            >
              <span>Track My Order</span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </Link>

            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-stone-400 text-xs flex items-center justify-between"
            >
              <span>Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
