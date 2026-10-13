// ============================================================================
// ADMIN LOGIN SCREEN: /admin/login
// Protected portal entry with brand identity and secure credentials input
// ============================================================================

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/admin';
import { getStoreSettings } from '@/lib/db/repository';
import { AdminLoginForm } from './AdminLoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session.isAuthenticated) {
    redirect('/admin/dashboard');
  }

  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen bg-[#121212] text-[#FAF9F6] flex flex-col justify-center items-center p-4 sm:p-8 font-mono">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-[#121212] to-black opacity-80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#1A1A1A] border border-stone-800 p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            {settings.logo_url ? (
              <div className="bg-white px-4 py-2 rounded inline-block shadow-sm">
                <Image
                  src={settings.logo_url}
                  alt={settings.store_name}
                  width={160}
                  height={50}
                  priority
                  className="h-9 w-auto object-contain"
                />
              </div>
            ) : (
              <h1 className="font-serif tracking-widest text-2xl font-bold uppercase text-white">
                {settings.store_name}
              </h1>
            )}
          </Link>

          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-stone-400 block font-semibold">
              Staff &amp; Concierge Portal
            </span>
            <p className="text-stone-500 text-xs mt-1">
              Authenticate with your staff email &amp; password.
            </p>
          </div>
        </div>

        {/* Login Form Client Component */}
        <AdminLoginForm />

        <div className="pt-4 border-t border-stone-800/80 text-center">
          <Link
            href="/"
            className="text-[11px] text-stone-500 hover:text-stone-300 transition-colors uppercase tracking-wider"
          >
            &larr; Return to Live Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
