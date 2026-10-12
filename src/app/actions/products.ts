'use server';

// ============================================================================
// SERVER ACTION: CREATE & EDIT PRODUCTS
// ============================================================================

import { createProduct, updateProduct, getProducts } from '@/lib/db/repository';
import { Product } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createProductAction(formData: {
  name: string;
  slug: string;
  description: string;
  primary_section_id?: string;
  regular_price_etb: number;
  sale_price_etb?: number;
  is_published: boolean;
  low_stock_threshold: number;
  image_url: string;
  variants: Array<{
    sku: string;
    size?: string;
    color?: string;
    stock_quantity: number;
  }>;
}) {
  try {
    const product = await createProduct({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      primary_section_id: formData.primary_section_id,
      regular_price_etb: formData.regular_price_etb,
      sale_price_etb: formData.sale_price_etb,
      is_featured: false,
      is_new_arrival: true,
      is_published: formData.is_published,
      is_archived: false,
      low_stock_threshold: formData.low_stock_threshold,
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: '',
          image_url: formData.image_url,
          alt_text: formData.name,
          display_order: 1,
          is_primary: true,
        },
      ],
      variants: formData.variants.map((v, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        product_id: '',
        sku: v.sku,
        size: v.size,
        color: v.color,
        stock_quantity: v.stock_quantity,
        is_available: v.stock_quantity > 0,
        created_at: new Date().toISOString(),
      })),
    });

    revalidatePath('/shop');
    revalidatePath('/admin/products');

    return { success: true, product };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
