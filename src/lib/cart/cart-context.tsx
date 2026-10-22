'use client';

// ============================================================================
// CLIENT-SIDE SHOPPING CART CONTEXT & STATE MANAGEMENT
// Synchronized with localStorage and validated against live server inventory
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalETB: number;
  totalCount: number;
  appliedCoupon: Coupon | null;
  couponDiscountETB: number;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCouponCode: () => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kenas_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem('kenas_coupon');
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch {
      // ignore JSON errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage on update
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('kenas_cart', JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem('kenas_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('kenas_coupon');
      }
    } catch {
      // ignore
    }
  }, [appliedCoupon, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variant_id === newItem.variant_id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + newItem.quantity, newItem.max_stock);
        return prev.map((i) =>
          i.variant_id === newItem.variant_id ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variant_id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.variant_id === variantId ? { ...i, quantity: Math.min(quantity, i.max_stock) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotalETB = items.reduce((sum, item) => sum + item.unit_price_etb * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate coupon discount
  let couponDiscountETB = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      let calc = Math.round((subtotalETB * appliedCoupon.discount_value) / 100);
      if (appliedCoupon.max_discount_etb && calc > appliedCoupon.max_discount_etb) {
        calc = appliedCoupon.max_discount_etb;
      }
      couponDiscountETB = calc;
    } else if (appliedCoupon.discount_type === 'fixed_amount') {
      couponDiscountETB = Math.min(appliedCoupon.discount_value, subtotalETB);
    }
  }

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotalETB}`);
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: `Coupon applied: -${data.discountETB} ETB discount.` };
      } else {
        return { success: false, message: data.error || 'Invalid coupon code.' };
      }
    } catch {
      return { success: false, message: 'Could not validate coupon at this time.' };
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotalETB,
        totalCount,
        appliedCoupon,
        couponDiscountETB,
        applyCouponCode,
        removeCouponCode,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
