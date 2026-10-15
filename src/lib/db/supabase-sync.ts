import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Product, Order } from '@/types';

export async function syncProductToSupabase(prod: Product): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  try {
    // 1. Check if product exists by slug
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .maybeSingle();

    let productId = existing?.id;

    if (!productId) {
      const { data: inserted, error: insertErr } = await supabase
        .from('products')
        .insert({
          name: prod.name,
          slug: prod.slug,
          description: prod.description || '',
          regular_price_etb: prod.regular_price_etb,
          sale_price_etb: prod.sale_price_etb || null,
          is_published: prod.is_published ?? true,
          is_featured: prod.is_featured ?? false,
          is_new_arrival: prod.is_new_arrival ?? false,
          is_archived: prod.is_archived ?? false,
          low_stock_threshold: prod.low_stock_threshold || 5,
        })
        .select('id')
        .single();

      if (insertErr || !inserted) {
        console.error('[Supabase sync insert product error]:', insertErr);
        return;
      }
      productId = inserted.id;
    } else {
      await supabase
        .from('products')
        .update({
          name: prod.name,
          description: prod.description || '',
          regular_price_etb: prod.regular_price_etb,
          sale_price_etb: prod.sale_price_etb || null,
          is_published: prod.is_published ?? true,
          is_featured: prod.is_featured ?? false,
          is_new_arrival: prod.is_new_arrival ?? false,
          is_archived: prod.is_archived ?? false,
          low_stock_threshold: prod.low_stock_threshold || 5,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
    }

    // 2. Sync variants
    if (productId && Array.isArray(prod.variants) && prod.variants.length > 0) {
      for (const v of prod.variants) {
        const sku = v.sku || `${prod.slug}-${v.size || 'os'}-${Date.now()}`;
        await supabase.from('product_variants').upsert(
          {
            product_id: productId,
            sku,
            size: v.size || null,
            color: v.color || null,
            stock_quantity: v.stock_quantity ?? 0,
            is_available: v.is_available ?? true,
          },
          { onConflict: 'sku' }
        );
      }
    }

    // 3. Sync images
    if (productId && Array.isArray(prod.images) && prod.images.length > 0) {
      // Clear previous images and re-insert
      await supabase.from('product_images').delete().eq('product_id', productId);
      for (let i = 0; i < prod.images.length; i++) {
        const img = prod.images[i];
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: img.image_url,
          alt_text: img.alt_text || prod.name,
          is_primary: img.is_primary ?? (i === 0),
          display_order: img.display_order ?? i + 1,
        });
      }
    }
  } catch (err) {
    console.error('[Supabase sync error]:', err);
  }
}

export async function deleteProductFromSupabase(slugOrId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  try {
    await supabase.from('products').delete().or(`slug.eq.${slugOrId},name.eq.${slugOrId}`);
  } catch (err) {
    console.error('[Supabase delete error]:', err);
  }
}

export async function loadProductsFromSupabase(): Promise<Product[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data: prods, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        regular_price_etb,
        sale_price_etb,
        is_published,
        is_featured,
        is_new_arrival,
        is_archived,
        low_stock_threshold,
        created_at,
        updated_at,
        product_variants (
          id,
          sku,
          size,
          color,
          stock_quantity,
          is_available,
          created_at
        ),
        product_images (
          id,
          image_url,
          alt_text,
          display_order,
          is_primary
        )
      `)
      .order('created_at', { ascending: false });

    if (error || !prods) {
      return null;
    }

    return prods.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      regular_price_etb: p.regular_price_etb,
      sale_price_etb: p.sale_price_etb || undefined,
      is_published: p.is_published ?? true,
      is_featured: p.is_featured ?? false,
      is_new_arrival: p.is_new_arrival ?? false,
      is_archived: p.is_archived ?? false,
      low_stock_threshold: p.low_stock_threshold || 5,
      created_at: p.created_at,
      updated_at: p.updated_at,
      variants: Array.isArray(p.product_variants)
        ? p.product_variants.map((v: any) => ({
            id: v.id,
            product_id: p.id,
            sku: v.sku,
            size: v.size || undefined,
            color: v.color || undefined,
            stock_quantity: v.stock_quantity ?? 0,
            is_available: v.is_available ?? true,
            created_at: v.created_at,
          }))
        : [],
      images: Array.isArray(p.product_images)
        ? p.product_images.map((img: any) => ({
            id: img.id,
            product_id: p.id,
            image_url: img.image_url,
            alt_text: img.alt_text || p.name,
            display_order: img.display_order ?? 1,
            is_primary: img.is_primary ?? false,
          }))
        : [],
    }));
  } catch (err) {
    console.error('[loadProductsFromSupabase error]:', err);
    return null;
  }
}

export async function syncOrderToSupabase(order: Order): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  try {
    let payloadNotes = order.notes || '';
    try {
      payloadNotes = JSON.stringify({
        notes: order.notes,
        items: order.items,
        fulfillment: order.fulfillment,
      });
    } catch {}

    const { error } = await supabase.from('orders').upsert(
      {
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_phone_normalized: order.customer_phone_normalized || order.customer_phone,
        customer_email: order.customer_email || null,
        fulfillment_type: order.fulfillment_type,
        order_status: order.order_status || 'confirmed',
        payment_status: order.payment_status || 'pending',
        payment_method: order.payment_method || 'cash_on_delivery',
        subtotal_etb: order.subtotal_etb,
        discount_amount_etb: order.discount_amount_etb || 0,
        applied_coupon_code: order.applied_coupon_code || null,
        delivery_fee_etb: order.delivery_fee_etb || 0,
        tax_amount_etb: order.tax_amount_etb || 0,
        total_amount_etb: order.total_amount_etb,
        tracking_token: order.tracking_token,
        notes: payloadNotes,
        created_at: order.created_at,
        updated_at: order.updated_at || order.created_at,
      },
      { onConflict: 'order_number' }
    );

    if (error) {
      console.error('[syncOrderToSupabase error]:', error);
    }
  } catch (err) {
    console.error('[syncOrderToSupabase error]:', err);
  }
}

export async function fetchOrderByNumberFromSupabase(orderNumber: string): Promise<Order | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const target = orderNumber.trim();
    const { data: ord, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('order_number', target)
      .maybeSingle();

    if (error || !ord) return null;

    let items = undefined;
    let fulfillment = undefined;
    let originalNotes = ord.notes;

    if (ord.notes && typeof ord.notes === 'string' && ord.notes.startsWith('{')) {
      try {
        const parsed = JSON.parse(ord.notes);
        if (parsed.items) items = parsed.items;
        if (parsed.fulfillment) fulfillment = parsed.fulfillment;
        if (parsed.notes !== undefined) originalNotes = parsed.notes;
      } catch {}
    }

    return {
      id: ord.id,
      order_number: ord.order_number,
      customer_id: ord.customer_id,
      customer_name: ord.customer_name,
      customer_phone: ord.customer_phone,
      customer_phone_normalized: ord.customer_phone_normalized,
      customer_email: ord.customer_email || undefined,
      fulfillment_type: ord.fulfillment_type,
      order_status: ord.order_status,
      payment_status: ord.payment_status,
      payment_method: ord.payment_method,
      subtotal_etb: ord.subtotal_etb,
      discount_amount_etb: ord.discount_amount_etb || 0,
      applied_coupon_code: ord.applied_coupon_code || undefined,
      delivery_fee_etb: ord.delivery_fee_etb || 0,
      tax_amount_etb: ord.tax_amount_etb || 0,
      total_amount_etb: ord.total_amount_etb,
      tracking_token: ord.tracking_token,
      notes: originalNotes,
      created_at: ord.created_at,
      updated_at: ord.updated_at,
      items,
      fulfillment,
    };
  } catch (err) {
    console.error('[fetchOrderByNumberFromSupabase error]:', err);
    return null;
  }
}

export async function fetchAllOrdersFromSupabase(): Promise<Order[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data: rows, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !rows) return null;

    return rows.map((ord: any) => {
      let items = undefined;
      let fulfillment = undefined;
      let originalNotes = ord.notes;

      if (ord.notes && typeof ord.notes === 'string' && ord.notes.startsWith('{')) {
        try {
          const parsed = JSON.parse(ord.notes);
          if (parsed.items) items = parsed.items;
          if (parsed.fulfillment) fulfillment = parsed.fulfillment;
          if (parsed.notes !== undefined) originalNotes = parsed.notes;
        } catch {}
      }

      return {
        id: ord.id,
        order_number: ord.order_number,
        customer_id: ord.customer_id,
        customer_name: ord.customer_name,
        customer_phone: ord.customer_phone,
        customer_phone_normalized: ord.customer_phone_normalized,
        customer_email: ord.customer_email || undefined,
        fulfillment_type: ord.fulfillment_type,
        order_status: ord.order_status,
        payment_status: ord.payment_status,
        payment_method: ord.payment_method,
        subtotal_etb: ord.subtotal_etb,
        discount_amount_etb: ord.discount_amount_etb || 0,
        applied_coupon_code: ord.applied_coupon_code || undefined,
        delivery_fee_etb: ord.delivery_fee_etb || 0,
        tax_amount_etb: ord.tax_amount_etb || 0,
        total_amount_etb: ord.total_amount_etb,
        tracking_token: ord.tracking_token,
        notes: originalNotes,
        created_at: ord.created_at,
        updated_at: ord.updated_at,
        items,
        fulfillment,
      };
    });
  } catch (err) {
    console.error('[fetchAllOrdersFromSupabase error]:', err);
    return null;
  }
}

