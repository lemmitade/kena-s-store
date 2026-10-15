// ============================================================================
// CANONICAL REDIRECT: /products/[slug] -> /product/[slug]
// Prevents 404 errors when visitors, ads, or search crawlers use plural /products/
// ============================================================================

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PluralProductRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
