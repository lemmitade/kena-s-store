import { MetadataRoute } from 'next';
import { getStoreSettings, getProducts, getSections, getCategories, getCompetitions } from '@/lib/db/repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getStoreSettings();
  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || settings.seo_settings?.canonical_url || 'https://kenasstore.com';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  const now = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bids`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bids/results`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // Dynamic Product routes
  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Section and Category routes
  const sections = await getSections();
  const categories = await getCategories();

  const sectionRoutes: MetadataRoute.Sitemap = sections.map((section) => ({
    url: `${baseUrl}/shop/${section.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = [];
  for (const cat of categories) {
    const parentSection = sections.find((s) => s.id === cat.section_id);
    if (parentSection) {
      categoryRoutes.push({
        url: `${baseUrl}/shop/${parentSection.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Dynamic Competition routes
  const competitions = await getCompetitions();
  const competitionRoutes: MetadataRoute.Sitemap = competitions.map((comp) => ({
    url: `${baseUrl}/bids/${comp.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...sectionRoutes,
    ...categoryRoutes,
    ...competitionRoutes,
  ];
}
