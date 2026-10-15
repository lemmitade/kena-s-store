// ============================================================================
// REST API: /api/products/[id]
// Get product details, update product (PUT/PATCH), delete product (DELETE)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from '@/lib/db/repository';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const product = (await getProductById(id)) || (await getProductBySlug(id, { allowDrafts: true }));

    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return handleUpdate(request, params);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    const { id } = await paramsPromise;
    const body = await request.json();

    const existing = (await getProductById(id)) || (await getProductBySlug(id, { allowDrafts: true }));
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Product "${id}" not found.` },
        { status: 404 }
      );
    }

    const updatePayload: any = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json(
          { success: false, error: 'Product name cannot be empty.' },
          { status: 400 }
        );
      }
      updatePayload.name = body.name.trim();
    }

    if (body.slug !== undefined) {
      const cleanSlug = String(body.slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (cleanSlug) {
        updatePayload.slug = cleanSlug;
      }
    }

    if (body.description !== undefined) {
      updatePayload.description = String(body.description).trim();
    }

    if (body.primary_section_id !== undefined) {
      updatePayload.primary_section_id = body.primary_section_id || undefined;
    }

    if (body.primary_category_id !== undefined) {
      updatePayload.primary_category_id = body.primary_category_id || undefined;
    }

    if (body.regular_price_etb !== undefined) {
      updatePayload.regular_price_etb = Number(body.regular_price_etb);
    }

    if (body.sale_price_etb !== undefined) {
      updatePayload.sale_price_etb = body.sale_price_etb ? Number(body.sale_price_etb) : undefined;
    }

    if (body.is_published !== undefined) {
      updatePayload.is_published = Boolean(body.is_published);
    }

    if (body.is_featured !== undefined) {
      updatePayload.is_featured = Boolean(body.is_featured);
    }

    if (body.is_new_arrival !== undefined) {
      updatePayload.is_new_arrival = Boolean(body.is_new_arrival);
    }

    if (body.low_stock_threshold !== undefined) {
      updatePayload.low_stock_threshold = Number(body.low_stock_threshold);
    }

    if (body.image_url !== undefined) {
      updatePayload.images = [
        {
          id: existing.images?.[0]?.id || `img-${Date.now()}`,
          product_id: existing.id,
          image_url: String(body.image_url).trim(),
          alt_text: updatePayload.name || existing.name,
          display_order: 1,
          is_primary: true,
        },
        ...(existing.images?.slice(1) || []),
      ];
    } else if (Array.isArray(body.images)) {
      updatePayload.images = body.images.map((img: any, idx: number) => ({
        id: img.id || `img-${Date.now()}-${idx}`,
        product_id: existing.id,
        image_url: img.image_url || img,
        alt_text: img.alt_text || updatePayload.name || existing.name,
        display_order: idx + 1,
        is_primary: idx === 0,
      }));
    }

    if (Array.isArray(body.variants)) {
      if (body.variants.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Product must have at least one variant.' },
          { status: 400 }
        );
      }

      updatePayload.variants = body.variants.map((v: any, idx: number) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        product_id: existing.id,
        sku: (v.sku || `SKU-${Date.now()}-${idx}`).trim().toUpperCase(),
        size: v.size?.trim(),
        color: v.color?.trim(),
        color_hex: v.color_hex?.trim(),
        stock_quantity: Math.max(0, Number(v.stock_quantity) || 0),
        is_available: Number(v.stock_quantity) > 0,
        price_override_etb: v.price_override_etb ? Number(v.price_override_etb) : undefined,
        created_at: v.created_at || new Date().toISOString(),
      }));
    }

    const updated = await updateProduct(existing.id, updatePayload);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update product.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Product "${updated.name}" updated successfully.`,
        product: updated,
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

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const existing = (await getProductById(id)) || (await getProductBySlug(id, { allowDrafts: true }));
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Product "${id}" not found.` },
        { status: 404 }
      );
    }

    const success = await deleteProduct(existing.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete product.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: `Product "${existing.name}" deleted successfully.` },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
