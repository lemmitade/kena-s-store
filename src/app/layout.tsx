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
  return {
    title: {
      default: `${settings.store_name} | Contemporary Ethiopian Sartorial Fashion`,
      template: `%s | ${settings.store_name}`,
    },
    description: settings.tagline || 'Curated Ethiopian fashion, artisanal highland leather, and minimalist essentials.',
    openGraph: {
      title: settings.store_name,
      description: settings.tagline,
      type: 'website',
      locale: 'en_ET',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#121212] selection:bg-stone-800 selection:text-white">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
