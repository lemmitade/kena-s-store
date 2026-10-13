'use server';

// ============================================================================
// SERVER ACTION: CREATE & EDIT PRODUCTS
// ============================================================================

import { createProduct, updateProduct, deleteProduct, getProducts } from '@/lib/db/repository';
import { Product } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createProductAction(formData: {
  name: string;
  slug: string;
  description: string;
  primary_section_id?: string;
  primary_category_id?: string;
  regular_price_etb: number;
  sale_price_etb?: number;
  is_published: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  low_stock_threshold: number;
  image_url: string;
  variants: Array<{
    sku: string;
    size?: string;
    color?: string;
    color_hex?: string;
    stock_quantity: number;
  }>;
}) {
  try {
    const product = await createProduct({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      primary_section_id: formData.primary_section_id,
      primary_category_id: formData.primary_category_id,
      regular_price_etb: formData.regular_price_etb,
      sale_price_etb: formData.sale_price_etb,
      is_featured: formData.is_featured ?? false,
      is_new_arrival: formData.is_new_arrival ?? true,
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
        color_hex: v.color_hex,
        stock_quantity: v.stock_quantity,
        is_available: v.stock_quantity > 0,
        created_at: new Date().toISOString(),
      })),
    });

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');

    return { success: true, product };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateProductAction(
  productId: string,
  formData: {
    name: string;
    slug: string;
    description: string;
    primary_section_id?: string;
    primary_category_id?: string;
    regular_price_etb: number;
    sale_price_etb?: number;
    is_published: boolean;
    is_featured?: boolean;
    is_new_arrival?: boolean;
    low_stock_threshold: number;
    image_url: string;
    variants: Array<{
      id?: string;
      sku: string;
      size?: string;
      color?: string;
      color_hex?: string;
      stock_quantity: number;
    }>;
  }
) {
  try {
    const updated = await updateProduct(productId, {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      primary_section_id: formData.primary_section_id,
      primary_category_id: formData.primary_category_id,
      regular_price_etb: formData.regular_price_etb,
      sale_price_etb: formData.sale_price_etb,
      is_featured: formData.is_featured,
      is_new_arrival: formData.is_new_arrival,
      is_published: formData.is_published,
      low_stock_threshold: formData.low_stock_threshold,
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: productId,
          image_url: formData.image_url,
          alt_text: formData.name,
          display_order: 1,
          is_primary: true,
        },
      ],
      variants: formData.variants.map((v, idx) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        product_id: productId,
        sku: v.sku,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex,
        stock_quantity: v.stock_quantity,
        is_available: v.stock_quantity > 0,
        created_at: new Date().toISOString(),
      })),
    });

    if (!updated) {
      return { success: false, error: 'Product not found.' };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    revalidatePath(`/product/${formData.slug}`);

    return { success: true, product: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const success = await deleteProduct(productId);
    if (!success) {
      return { success: false, error: 'Product not found.' };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
