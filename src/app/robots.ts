import { MetadataRoute } from 'next';
import { getStoreSettings } from '@/lib/db/repository';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getStoreSettings();
  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || settings.seo_settings?.canonical_url || 'https://kenasstore.com';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/account/', '/checkout', '/order-confirmation/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
