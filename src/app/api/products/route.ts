// ============================================================================
// REST API: /api/products
// List published/draft products, search, filter, and create products
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionSlug = searchParams.get('section') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const searchQuery = searchParams.get('q') || undefined;
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const isFeatured = searchParams.has('featured')
      ? searchParams.get('featured') === 'true'
      : undefined;
    const isNewArrival = searchParams.has('newArrival')
      ? searchParams.get('newArrival') === 'true'
      : undefined;

    const products = await getProducts({
      sectionSlug,
      categorySlug,
      searchQuery,
      includeDrafts,
      isFeatured,
      isNewArrival,
    });

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product "name" is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!body.variants || !Array.isArray(body.variants) || body.variants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one variant SKU is required.' },
        { status: 400 }
      );
    }

    const cleanSlug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProduct = await createProduct({
      name: body.name.trim(),
      slug: cleanSlug,
      description: body.description?.trim() || '',
      primary_section_id: body.primary_section_id || undefined,
      primary_category_id: body.primary_category_id || undefined,
      regular_price_etb: Number(body.regular_price_etb) || 0,
      sale_price_etb: body.sale_price_etb ? Number(body.sale_price_etb) : undefined,
      is_featured: Boolean(body.is_featured),
      is_new_arrival: body.is_new_arrival !== undefined ? Boolean(body.is_new_arrival) : true,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      is_archived: false,
      low_stock_threshold: Number(body.low_stock_threshold) || 3,
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images.map((img: any, idx: number) => ({
            id: img.id || `img-${Date.now()}-${idx}`,
            product_id: '',
            image_url: img.image_url || img,
            alt_text: img.alt_text || body.name,
            display_order: idx + 1,
            is_primary: idx === 0,
          }))
        : body.image_url
        ? [
            {
              id: `img-${Date.now()}`,
              product_id: '',
              image_url: body.image_url,
              alt_text: body.name,
              display_order: 1,
              is_primary: true,
            },
          ]
        : [],
      variants: body.variants.map((v: any, idx: number) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        product_id: '',
        sku: (v.sku || `SKU-${Date.now()}-${idx}`).trim().toUpperCase(),
        size: v.size?.trim(),
        color: v.color?.trim(),
        color_hex: v.color_hex?.trim(),
        stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
        is_available: Number(v.stock_quantity) > 0,
        price_override_etb: v.price_override_etb ? Number(v.price_override_etb) : undefined,
        created_at: new Date().toISOString(),
      })),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
