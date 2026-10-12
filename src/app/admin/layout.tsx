// ============================================================================
// ADMIN DASHBOARD LAYOUT & NAVIGATION
// Protected admin shell with sidebar, role indicators, and quick links
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/repository';
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  ShoppingBag,
  Users,
  Layers,
  FolderTree,
  Tag,
  Trophy,
  Sliders,
  CreditCard,
  Truck,
  MapPin,
  ShieldAlert,
  History,
  ExternalLink,
  BarChart3,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  const navGroups = [
    {
      title: 'Analytics & Overview',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Sales Reports', href: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'Catalog & Inventory',
      items: [
        { label: 'Products', href: '/admin/products', icon: Shirt },
        { label: 'Inventory Matrix', href: '/admin/inventory', icon: Boxes },
        { label: 'Store Sections', href: '/admin/catalog/sections', icon: Layers },
        { label: 'Categories', href: '/admin/catalog/categories', icon: FolderTree },
      ],
    },
    {
      title: 'Fulfillment & CRM',
      items: [
        { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers & Export', href: '/admin/customers', icon: Users },
      ],
    },
    {
      title: 'Marketing & Bids',
      items: [
        { label: 'Coupons & Vouchers', href: '/admin/marketing/coupons', icon: Tag },
        { label: 'Unique-Lowest-Bid', href: '/admin/bids', icon: Trophy },
      ],
    },
    {
      title: 'Settings & Security',
      items: [
        { label: 'Store & Branding', href: '/admin/settings/store', icon: Sliders },
        { label: 'Payment Gateway', href: '/admin/settings/payments', icon: CreditCard },
        { label: 'Delivery Zones', href: '/admin/settings/delivery', icon: Truck },
        { label: 'Pickup Locations', href: '/admin/settings/pickup-locations', icon: MapPin },
        { label: 'Staff Roles & RBAC', href: '/admin/staff', icon: ShieldAlert },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#121212] flex flex-col md:flex-row">
      {/* 1. SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#121212] text-[#FAF9F6] flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div>
              <span className="font-serif tracking-widest text-lg font-bold uppercase text-white block">
                {settings.store_name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                Staff Control Center
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 px-3 block mb-1">
                  {group.title}
                </span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-mono text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-stone-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom user badge & live store link */}
        <div className="p-4 border-t border-stone-800 bg-black/40 text-xs font-mono">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span>Role: Super Admin</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-white hover:underline text-[11px] pt-1"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#E7E5E4] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500">
              Admin Workspace
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs font-mono font-semibold text-stone-900">
              Addis Ababa Operations
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
            <span>Server Clock: {new Date().toLocaleTimeString('en-ET')}</span>
          </div>
        </header>

        <main className="p-6 sm:p-8 lg:p-10 flex-1 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
