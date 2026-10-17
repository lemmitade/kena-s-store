'use client';

// ============================================================================
// CHECKOUT FORM COMPONENT
// Dual fulfillment selection (Pickup/Delivery), live zones, phone validation, Server Action
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart/cart-context';
import { DeliveryZone, PickupLocation, StoreSettings } from '@/types';
import { formatETB } from '@/lib/utils/format';
import { normalizeEthiopianPhone } from '@/lib/utils/phone';
import { processCheckoutAction } from '@/app/actions/checkout';
import { Truck, Store, AlertCircle, Lock } from 'lucide-react';

interface CheckoutFormProps {
  pickupLocations: PickupLocation[];
  deliveryZones: DeliveryZone[];
  settings: StoreSettings;
}

export function CheckoutForm({ pickupLocations, deliveryZones, settings }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotalETB, appliedCoupon, couponDiscountETB, clearCart } = useCart();

  // Contact details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Fulfillment state
  const [fulfillmentType, setFulfillmentType] = useState<'home_delivery' | 'store_pickup'>('home_delivery');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(deliveryZones[0]?.id || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliverySubCity, setDeliverySubCity] = useState('Bole');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const [selectedPickupId, setSelectedPickupId] = useState<string>(pickupLocations[0]?.id || '');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'chapa'>('cash_on_delivery');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Calculate Delivery or Pickup Fee
  let fulfillmentFeeETB = 0;
  let isFreeDelivery = false;

  if (fulfillmentType === 'store_pickup') {
    const loc = pickupLocations.find((l) => l.id === selectedPickupId);
    fulfillmentFeeETB = loc?.pickup_fee_etb || 0;
  } else {
    const zone = deliveryZones.find((z) => z.id === selectedZoneId);
    if (zone) {
      if (zone.free_delivery_threshold_etb && subtotalETB >= zone.free_delivery_threshold_etb) {
        fulfillmentFeeETB = 0;
        isFreeDelivery = true;
      } else if (appliedCoupon?.discount_type === 'free_delivery') {
        fulfillmentFeeETB = 0;
        isFreeDelivery = true;
      } else {
        fulfillmentFeeETB = zone.fee_etb;
      }
    }
  }

  const finalTotalETB = Math.max(0, subtotalETB - couponDiscountETB + fulfillmentFeeETB);

  // Addis Ababa Sub-Cities
  const subCities = [
    'Bole',
    'Kirkos',
    'Arada',
    'Lideta',
    'Yeka',
    'Nifas Silk Lafto',
    'Kolfe Keranio',
    'Gullele',
    'Akaki Kality',
    'Addis Ketema',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const phoneVal = normalizeEthiopianPhone(customerPhone);
    if (!phoneVal.isValid) {
      setErrorMessage(phoneVal.error || 'Please enter a valid Ethiopian phone number.');
      return;
    }

    if (fulfillmentType === 'home_delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide your delivery address or building name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await processCheckoutAction({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        marketing_consent: marketingConsent,
        fulfillment_type: fulfillmentType,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code,
        delivery_zone_id: fulfillmentType === 'home_delivery' ? selectedZoneId : undefined,
        delivery_address: deliveryAddress.trim(),
        delivery_sub_city: deliverySubCity,
        delivery_instructions: deliveryInstructions.trim() || undefined,
        pickup_location_id: fulfillmentType === 'store_pickup' ? selectedPickupId : undefined,
        items: items.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
      });

      if (!result.success || !result.orderNumber) {
        setErrorMessage(result.error || 'Could not process order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully
      clearCart();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      router.push(`/order-confirmation/${result.orderNumber}?token=${result.trackingToken}`);
    } catch (err) {
      setErrorMessage(`Unexpected error: ${(err as Error).message}`);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-serif">Your bag is empty</h2>
        <p className="text-xs font-mono text-stone-500 mt-2 mb-6">
          Add items to your bag before checking out.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[#121212] text-white px-8 py-3.5 text-xs font-mono uppercase tracking-widest"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* 1. LEFT COLUMN: DETAILS & FULFILLMENT (7 COLS) */}
      <div className="lg:col-span-7 space-y-10">
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CONTACT INFORMATION */}
        <section className="space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="text-sm font-mono uppercase tracking-widest font-semibold text-stone-900">
              1. Customer Details (Guest Checkout)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Abebe Kebede"
                className="w-full bg-white border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Phone Number (Ethio Telecom / Safaricom) *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09... or 07..."
                className="w-full bg-white border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-stone-900"
              />
              <span className="text-[10px] font-mono text-stone-400 block">
                Format: 0911234567 or +251911234567
              </span>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Email Address (Optional for digital receipts)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="abebe@example.com"
                className="w-full bg-white border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>
        </section>

        {/* STEP 2: FULFILLMENT METHOD */}
        <section className="space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="text-sm font-mono uppercase tracking-widest font-semibold text-stone-900">
              2. Fulfillment Method
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFulfillmentType('home_delivery')}
              className={`p-4 border text-left transition-all flex flex-col gap-2 ${
                fulfillmentType === 'home_delivery'
                  ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                  : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <Truck className="w-5 h-5" />
                <span className="text-xs font-mono font-semibold">
                  {fulfillmentFeeETB > 0 && fulfillmentType === 'home_delivery'
                    ? formatETB(fulfillmentFeeETB)
                    : isFreeDelivery
                    ? 'FREE'
                    : 'From 200 ETB'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">Home Delivery</p>
                <p className="text-[11px] font-mono text-stone-500">Addis Ababa &amp; Regional Express</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFulfillmentType('store_pickup')}
              className={`p-4 border text-left transition-all flex flex-col gap-2 ${
                fulfillmentType === 'store_pickup'
                  ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                  : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <Store className="w-5 h-5" />
                <span className="text-xs font-mono font-semibold text-emerald-700">FREE</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">Store Pickup</p>
                <p className="text-[11px] font-mono text-stone-500">Collect with PIN Code</p>
              </div>
            </button>
          </div>

          {/* Conditional Delivery Address Inputs */}
          {fulfillmentType === 'home_delivery' ? (
            <div className="bg-white border border-[#E7E5E4] p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  Delivery Zone *
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-stone-900"
                >
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {formatETB(z.fee_etb)} (Est: {z.estimated_delivery_time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                    Sub-City *
                  </label>
                  <select
                    value={deliverySubCity}
                    onChange={(e) => setDeliverySubCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                  >
                    {subCities.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc} Sub-City
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                    Street / Building / House *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Cameroon St, Near Medhanialem Mall"
                    className="w-full bg-white border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call upon arrival at security gate"
                  className="w-full bg-white border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          ) : (
            /* Conditional Store Pickup Inputs */
            <div className="bg-white border border-[#E7E5E4] p-5 space-y-4">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 block">
                Select Pickup Location *
              </label>
              <div className="space-y-3">
                {pickupLocations.map((loc) => (
                  <label
                    key={loc.id}
                    className={`block p-4 border cursor-pointer transition-all ${
                      selectedPickupId === loc.id
                        ? 'border-stone-900 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pickupLocation"
                        checked={selectedPickupId === loc.id}
                        onChange={() => setSelectedPickupId(loc.id)}
                        className="text-stone-900 focus:ring-0"
                      />
                      <div className="space-y-1 text-xs">
                        <span className="font-semibold text-stone-900 block text-sm">
                          {loc.name}
                        </span>
                        <p className="text-stone-600">{loc.address_line}</p>
                        <p className="font-mono text-stone-400">Hours: {loc.opening_hours}</p>
                        {loc.instructions && (
                          <p className="text-stone-500 italic pt-1">{loc.instructions}</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* STEP 3: PAYMENT METHOD */}
        <section className="space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="text-sm font-mono uppercase tracking-widest font-semibold text-stone-900">
              3. Payment Selection
            </h2>
          </div>

          <div className="space-y-3">
            <label
              className={`block p-4 border cursor-pointer transition-all ${
                paymentMethod === 'cash_on_delivery'
                  ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                  : 'border-stone-200 bg-stone-50 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="text-stone-900 focus:ring-0"
                />
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">
                    Cash on Delivery (COD) / Pay upon Collection
                  </span>
                  <p className="text-xs font-mono text-stone-500">
                    Pay our courier directly in cash or Telebirr upon physical receipt and inspection.
                  </p>
                </div>
              </div>
            </label>

            <label
              className={`block p-4 border cursor-pointer transition-all ${
                paymentMethod === 'chapa'
                  ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                  : 'border-stone-200 bg-stone-50 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="chapa"
                  checked={paymentMethod === 'chapa'}
                  onChange={() => setPaymentMethod('chapa')}
                  className="text-stone-900 focus:ring-0"
                />
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">
                    Online Payment (Chapa: Telebirr, CBE Birr, Cards)
                  </span>
                  <p className="text-xs font-mono text-stone-500">
                    {settings.chapa_enabled
                      ? 'Secure digital payment verified via Chapa gateway.'
                      : 'Live Chapa gateway integration ready (Configurable in Admin settings).'}
                  </p>
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* STEP 4: MARKETING CONSENT */}
        <section className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-600">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-0"
            />
            <span>
              I agree to receive transactional WhatsApp/SMS and occasional private collection alerts from {settings.store_name}. (Optional)
            </span>
          </label>
        </section>
      </div>

      {/* 2. RIGHT COLUMN: ORDER SUMMARY SNAPSHOT (5 COLS) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-[#E7E5E4] p-6 space-y-6 sticky top-28">
          <h2 className="text-lg font-serif font-medium border-b border-stone-200 pb-3">
            Bag Items ({items.length})
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.variant_id} className="flex items-center gap-3">
                <div className="relative w-14 h-16 bg-stone-100 flex-shrink-0 overflow-hidden">
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-medium text-stone-900 truncate">{item.product_name}</p>
                  <p className="font-mono text-stone-400">
                    {item.size ? `Size ${item.size} • ` : ''}Qty {item.quantity}
                  </p>
                  <p className="font-mono font-semibold text-stone-800">
                    {formatETB(item.unit_price_etb * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-4 space-y-2.5 text-xs font-mono">
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

            <div className="flex justify-between text-stone-600">
              <span>Fulfillment Fee</span>
              <span className="font-semibold text-stone-900">
                {isFreeDelivery ? 'FREE (Threshold met)' : formatETB(fulfillmentFeeETB)}
              </span>
            </div>

            <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-bold text-[#121212]">
              <span>Final Total</span>
              <span>{formatETB(finalTotalETB)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#121212] text-[#FAF9F6] h-14 uppercase tracking-widest text-xs font-semibold font-mono flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? 'Confirming Order...' : `Confirm Order (${formatETB(finalTotalETB)})`}</span>
          </button>

          <div className="text-[11px] font-mono text-stone-400 space-y-1 text-center">
            <p>✓ Immutable order fee snapshot preserved</p>
            <p>✓ All totals strictly revalidated on server</p>
          </div>
        </div>
      </div>
    </form>
  );
}
