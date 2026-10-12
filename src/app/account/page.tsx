// ============================================================================
// CUSTOMER ACCOUNT PAGE: /account
// Profile overview, order history link, contact preferences
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { getStoreSettings, getSections, getAllCustomers, getAllOrders } from '@/lib/db/repository';
import { formatETB } from '@/lib/utils/format';
import { User, Package, Shield, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const settings = await getStoreSettings();
  const sections = await getSections();
  const orders = await getAllOrders();
  const customers = await getAllCustomers();

  // Primary customer demo record
  const customer = customers[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212]">
      <Header sections={sections} settings={settings} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full space-y-12">
        <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
              Customer Portal
            </span>
            <h1 className="text-3xl font-serif font-light mt-1">My Account</h1>
          </div>
          <Link
            href="/track-order"
            className="text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-black underline"
          >
            Track A Shipment →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-semibold">
              <User className="w-4 h-4" />
              <span>Client Profile</span>
            </div>
            <div className="text-xs font-mono space-y-1.5 text-stone-600">
              <p className="font-semibold text-stone-900 text-sm">{customer?.full_name || 'Guest User'}</p>
              <p>Phone: {customer?.phone || '+251 91 123 4567'}</p>
              <p>Email: {customer?.email || 'Not provided'}</p>
              <p className="text-emerald-700 pt-1">
                {customer?.marketing_consent ? '✓ Promotional Dispatch Opted-in' : 'Standard Account'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-semibold">
              <Package className="w-4 h-4" />
              <span>Order Activity</span>
            </div>
            <div className="text-xs font-mono space-y-2 text-stone-600">
              <div className="flex justify-between">
                <span>Total Orders Placed:</span>
                <span className="font-bold text-stone-900">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Spend:</span>
                <span className="font-bold text-stone-900">
                  {formatETB(orders.reduce((sum, o) => sum + o.total_amount_etb, 0))}
                </span>
              </div>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1.5 text-stone-900 underline pt-2 font-semibold"
              >
                <span>View Full Order History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-semibold">
              <Shield className="w-4 h-4" />
              <span>Staff Management</span>
            </div>
            <p className="text-xs font-mono text-stone-500">
              Authorized staff can manage products, fulfill orders, configure delivery zones, and run audits.
            </p>
            <Link
              href="/admin/dashboard"
              className="inline-block bg-stone-900 text-white px-4 py-2 text-xs font-mono uppercase tracking-wider"
            >
              Enter Admin Portal
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
