// ============================================================================
// ADMIN DASHBOARD LAYOUT & NAVIGATION
// Protected admin shell with sidebar, role indicators, and quick links
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { headers } from 'next/headers';
import { getStoreSettings } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth/admin';
import { logoutAdminAction } from '@/app/actions/auth';
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
  LogOut,
  Sparkles,
  Megaphone,
  Search,
  Lock,
  Globe,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const isLoginPage = headerList.get('x-is-admin-login') === 'true';

  // If on /admin/login, render without sidebar shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  const settings = await getStoreSettings();
  const session = await getAdminSession();

  const navGroups = [
    {
      title: 'Analytics & Overview',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Sales Reports', href: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'Hero & Content Editor',
      items: [
        { label: 'Hero Slides & Video', href: '/admin/content/hero', icon: Sparkles },
      ],
    },
    {
      title: 'Catalog & Inventory',
      items: [
        { label: 'Products & Variants', href: '/admin/products', icon: Shirt },
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
        { label: 'Pop Ads (Scroll/Enter)', href: '/admin/marketing/pop-ads', icon: Megaphone },
        { label: 'Coupons & Vouchers', href: '/admin/marketing/coupons', icon: Tag },
        { label: 'Unique-Lowest-Bid', href: '/admin/bids', icon: Trophy },
        { label: 'Bidding Preferences', href: '/admin/bids/settings', icon: Sliders },
      ],
    },
    {
      title: 'Settings & Security',
      items: [
        { label: 'SEO Management', href: '/admin/seo', icon: Search },
        { label: 'GoDaddy Domain & SSL', href: '/admin/settings/domain', icon: Globe },
        { label: 'Store & Branding', href: '/admin/settings/store', icon: Sliders },
        { label: 'Payment Gateway', href: '/admin/settings/payments', icon: CreditCard },
        { label: 'Delivery Zones', href: '/admin/settings/delivery', icon: Truck },
        { label: 'Pickup Locations', href: '/admin/settings/pickup-locations', icon: MapPin },
        { label: 'Admin Login & Security', href: '/admin/settings/security', icon: Lock },
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
            <Link href="/admin/dashboard" className="block hover:opacity-90 transition-opacity">
              {settings.logo_url ? (
                <div className="bg-white px-3 py-1.5 rounded inline-block mb-1.5">
                  <Image
                    src={settings.logo_url}
                    alt={settings.store_name}
                    width={130}
                    height={40}
                    priority
                    className="h-7 w-auto object-contain"
                  />
                </div>
              ) : (
                <span className="font-serif tracking-widest text-lg font-bold uppercase text-white block">
                  {settings.store_name}
                </span>
              )}
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                Staff Control Center
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
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

        {/* Bottom User Badge & Logout */}
        <div className="p-4 border-t border-stone-800 bg-black/40 text-xs font-mono space-y-3">
          <div className="flex items-center justify-between text-stone-400">
            <div className="truncate max-w-[170px]">
              <span className="block text-[10px] text-stone-500 uppercase">Logged In:</span>
              <span className="text-stone-300 truncate block text-[11px]">
                {session.email || 'admin@kenastore.et'}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Active" />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-800/60">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-stone-400 hover:text-white text-[11px] transition-colors"
              title="Open Live Storefront"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-[11px] transition-colors py-1 px-1.5"
                title="Sign out of Admin Dashboard"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </form>
          </div>
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
              Kena Store Staff Management
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
            <span className="hidden sm:inline">Addis Ababa Operations</span>
          </div>
        </header>

        <main className="p-6 sm:p-8 lg:p-10 flex-1 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
