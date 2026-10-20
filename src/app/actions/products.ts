'use server';

// ============================================================================
// SERVER ACTION: CREATE & EDIT PRODUCTS
// ============================================================================

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '@/lib/db/repository';
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
    if (!formData.name?.trim()) {
      return { success: false, error: 'Product name is required.' };
    }
    if (!formData.variants || formData.variants.length === 0) {
      return { success: false, error: 'At least one variant SKU is required.' };
    }

    const cleanSlug = (formData.slug || formData.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const product = await createProduct({
      name: formData.name.trim(),
      slug: cleanSlug,
      description: formData.description?.trim() || '',
      primary_section_id: formData.primary_section_id || undefined,
      primary_category_id: formData.primary_category_id || undefined,
      regular_price_etb: Number(formData.regular_price_etb) || 0,
      sale_price_etb: formData.sale_price_etb ? Number(formData.sale_price_etb) : undefined,
      is_featured: formData.is_featured ?? false,
      is_new_arrival: formData.is_new_arrival ?? true,
      is_published: formData.is_published,
      is_archived: false,
      low_stock_threshold: Number(formData.low_stock_threshold) || 3,
      images: formData.image_url?.trim()
        ? [
            {
              id: `img-${Date.now()}`,
              product_id: '',
              image_url: formData.image_url.trim(),
              alt_text: formData.name.trim(),
              display_order: 1,
              is_primary: true,
            },
          ]
        : [],
      variants: formData.variants.map((v, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        product_id: '',
        sku: (v.sku || `${cleanSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${(v.size || 'STD').toUpperCase()}-${idx + 1}`).trim().toUpperCase(),
        size: v.size?.trim(),
        color: v.color?.trim(),
        color_hex: v.color_hex?.trim(),
        stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
        is_available: Number(v.stock_quantity) > 0,
        created_at: new Date().toISOString(),
      })),
    });

    // Comprehensive cache invalidation
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/products/${product.slug}`);
      revalidatePath('/admin/products');
      revalidatePath('/admin/inventory');
    } catch {
      // ignore in non-request test contexts
    }

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
    if (!formData.name?.trim()) {
      return { success: false, error: 'Product name cannot be empty.' };
    }
    if (!formData.variants || formData.variants.length === 0) {
      return { success: false, error: 'Product must have at least one variant SKU.' };
    }

    const previousProduct = await getProductById(productId);
    const oldSlug = previousProduct?.slug;

    const cleanSlug = (formData.slug || formData.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const updated = await updateProduct(productId, {
      name: formData.name.trim(),
      slug: cleanSlug,
      description: formData.description?.trim() || '',
      primary_section_id: formData.primary_section_id || undefined,
      primary_category_id: formData.primary_category_id || undefined,
      regular_price_etb: Number(formData.regular_price_etb) || 0,
      sale_price_etb: formData.sale_price_etb ? Number(formData.sale_price_etb) : undefined,
      is_featured: formData.is_featured,
      is_new_arrival: formData.is_new_arrival,
      is_published: formData.is_published,
      low_stock_threshold: Number(formData.low_stock_threshold) || 3,
      images: formData.image_url?.trim()
        ? [
            {
              id: previousProduct?.images?.[0]?.id || `img-${Date.now()}`,
              product_id: productId,
              image_url: formData.image_url.trim(),
              alt_text: formData.name.trim(),
              display_order: 1,
              is_primary: true,
            },
            ...(previousProduct?.images?.slice(1) || []),
          ]
        : previousProduct?.images || [],
      variants: formData.variants.map((v, idx) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        product_id: productId,
        sku: (v.sku || `${cleanSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${(v.size || 'STD').toUpperCase()}-${idx + 1}`).trim().toUpperCase(),
        size: v.size?.trim(),
        color: v.color?.trim(),
        color_hex: v.color_hex?.trim(),
        stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
        is_available: Number(v.stock_quantity) > 0,
        created_at: new Date().toISOString(),
      })),
    });

    if (!updated) {
      return { success: false, error: 'Product not found in repository.' };
    }

    // Invalidate all related storefront & admin paths
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/products/${productId}`);
      revalidatePath(`/product/${updated.slug}`);
      revalidatePath(`/products/${updated.slug}`);
      if (oldSlug && oldSlug !== updated.slug) {
        revalidatePath(`/product/${oldSlug}`);
        revalidatePath(`/products/${oldSlug}`);
        revalidatePath(`/admin/products/${oldSlug}`);
      }
    } catch {
      // ignore in non-request test contexts
    }

    return { success: true, product: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const previous = await getProductById(productId);
    const success = await deleteProduct(productId);
    if (!success) {
      return { success: false, error: 'Product not found.' };
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
      revalidatePath('/admin/inventory');
      if (previous?.slug) {
        revalidatePath(`/product/${previous.slug}`);
        revalidatePath(`/products/${previous.slug}`);
      }
    } catch {
      // ignore
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
