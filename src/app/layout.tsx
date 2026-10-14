import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart/cart-context';
import { getStoreSettings } from '@/lib/db/repository';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const seo = settings.seo_settings;

  const title = seo?.meta_title || `${settings.store_name} | Contemporary Ethiopian Sartorial Fashion`;
  const description =
    seo?.meta_description ||
    settings.tagline ||
    'Curated Ethiopian fashion, artisanal highland leather, and minimalist essentials.';
  const canonicalUrl = seo?.canonical_url || 'https://kenastore.et';
  const ogImage = seo?.og_image_url || settings.logo_url || '/logo.png';

  return {
    metadataBase: new URL(canonicalUrl),
    title: {
      default: title,
      template: `%s | ${settings.store_name}`,
    },
    description,
    keywords: seo?.keywords ? seo.keywords.split(',').map((k) => k.trim()) : undefined,
    robots: {
      index: seo?.allow_indexing ?? true,
      follow: seo?.allow_indexing ?? true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: settings.store_name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: settings.store_name,
        },
      ],
      type: 'website',
      locale: 'en_ET',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: seo?.twitter_handle || '@kenastore',
      images: [ogImage],
    },
    verification: {
      google: seo?.google_site_verification || process.env.GOOGLE_SITE_VERIFICATION || 'XUH3QQTaQBIpwlIBQ_DVgiUPj_by3clSZ1LHRFWOS3k',
    },
  };
}

import { PopupPromoModal } from '@/components/storefront/PopupPromoModal';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#121212] selection:bg-stone-800 selection:text-white">
        <CartProvider>
          {children}
          <PopupPromoModal settings={settings.popup_ad} />
        </CartProvider>
      </body>
    </html>
  );
}
