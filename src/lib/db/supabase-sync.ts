import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Product, Order } from '@/types';

export async function syncProductToSupabase(prod: Product): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  try {
    // 1. Check if product exists by UUID ID, cloud_id, or slug
    const idUuid = Boolean(prod.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prod.id));
    const cloudUuid = Boolean(prod.cloud_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prod.cloud_id));
    let productId: string | undefined = undefined;

    const targetUuid = (idUuid ? prod.id : undefined) || (cloudUuid ? prod.cloud_id : undefined);
    if (targetUuid) {
      const { data: byId } = await supabase
        .from('products')
        .select('id')
        .eq('id', targetUuid)
        .maybeSingle();
      if (byId) productId = byId.id;
    }

    if (!productId) {
      const { data: bySlug } = await supabase
        .from('products')
        .select('id')
        .eq('slug', prod.slug)
        .maybeSingle();
      if (bySlug) productId = bySlug.id;
    }

    if (!productId) {
      const insertData: Record<string, unknown> = {
        name: prod.name,
        slug: prod.slug,
        description: prod.description || '',
        primary_section_id: prod.primary_section_id || null,
        primary_category_id: prod.primary_category_id || null,
        regular_price_etb: prod.regular_price_etb,
        sale_price_etb: prod.sale_price_etb || null,
        is_published: prod.is_published ?? true,
        is_featured: prod.is_featured ?? false,
        is_new_arrival: prod.is_new_arrival ?? false,
        is_archived: prod.is_archived ?? false,
        low_stock_threshold: prod.low_stock_threshold || 5,
      };
      if (idUuid && prod.id) {
        insertData.id = prod.id;
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('products')
        .insert(insertData)
        .select('id')
        .single();

      if (insertErr || !inserted) {
        console.error('[Supabase sync insert product error]:', insertErr);
        return;
      }
      productId = inserted.id;
      prod.cloud_id = productId;
    } else {
      const updateData: Record<string, unknown> = {
        name: prod.name,
        slug: prod.slug,
        description: prod.description || '',
        primary_section_id: prod.primary_section_id || null,
        primary_category_id: prod.primary_category_id || null,
        regular_price_etb: prod.regular_price_etb,
        sale_price_etb: prod.sale_price_etb || null,
        is_published: prod.is_published ?? true,
        is_featured: prod.is_featured ?? false,
        is_new_arrival: prod.is_new_arrival ?? false,
        is_archived: prod.is_archived ?? false,
        low_stock_threshold: prod.low_stock_threshold || 5,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);
    }

    // 2. Sync variants
    if (productId && Array.isArray(prod.variants) && prod.variants.length > 0) {
      // Fetch existing variants for this product in Supabase
      const { data: existingVariants, error: fetchErr } = await supabase
        .from('product_variants')
        .select('id, sku')
        .eq('product_id', productId);

      if (!fetchErr && existingVariants) {
        const submittedIds = new Set(
          prod.variants
            .map((v) => v.id)
            .filter((id): id is string => Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))
        );

        // Delete variants that were removed in the editor
        const toDelete = existingVariants.filter((ev) => !submittedIds.has(ev.id));
        for (const ev of toDelete) {
          await supabase.from('product_variants').delete().eq('id', ev.id);
        }
      }

      // Upsert / insert each variant
      for (let idx = 0; idx < prod.variants.length; idx++) {
        const v = prod.variants[idx];
        const isUuid = Boolean(v.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id));

        let sku = (v.sku && v.sku.trim())
          ? v.sku.trim().toUpperCase()
          : `${(prod.slug || 'PRD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${v.size || 'STD'}-${idx + 1}`;

        // Check if SKU exists in the database
        const { data: existingSkuRecord } = await supabase
          .from('product_variants')
          .select('id, product_id')
          .eq('sku', sku)
          .maybeSingle();

        if (existingSkuRecord && existingSkuRecord.product_id !== productId) {
          // SKU is already registered to another product! Make it unique so we never steal or conflict
          const baseCode = (prod.slug || 'PRD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
          sku = `${baseCode}-${v.size || 'STD'}-${Date.now().toString().slice(-4)}${idx}`;
          v.sku = sku;
        }

        const stock = Math.max(0, Number(v.stock_quantity) || 0);
        const variantPayload: Record<string, unknown> = {
          product_id: productId,
          sku,
          size: v.size?.trim() || null,
          color: v.color?.trim() || null,
          stock_quantity: stock,
          is_available: stock > 0,
          updated_at: new Date().toISOString(),
        };

        if (isUuid) {
          variantPayload.id = v.id;
          const { error: upsertErr } = await supabase
            .from('product_variants')
            .upsert(variantPayload, { onConflict: 'id' });
          if (upsertErr) {
            console.error('[Supabase sync variant upsert error]:', upsertErr);
          }
        } else if (existingSkuRecord && existingSkuRecord.product_id === productId) {
          v.id = existingSkuRecord.id;
          await supabase
            .from('product_variants')
            .update(variantPayload)
            .eq('id', existingSkuRecord.id);
        } else {
          const { data: insData, error: insErr } = await supabase
            .from('product_variants')
            .insert(variantPayload)
            .select('id')
            .single();

          if (insData) {
            v.id = insData.id;
          } else if (insErr) {
            console.error('[Supabase sync variant insert error]:', insErr);
          }
        }
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

export async function deleteProductFromSupabase(
  slugOrId: string,
  extra?: { slug?: string; name?: string; cloud_id?: string }
): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  try {
    const isUuid = (val?: string) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    // 1. Delete by UUID if target or cloud_id is UUID
    const uuidToDelete = [slugOrId, extra?.cloud_id].find(isUuid);
    if (uuidToDelete) {
      const { error } = await supabase.from('products').delete().eq('id', uuidToDelete);
      if (error) console.error('[Supabase delete by id error]:', error);
    }

    // 2. Delete by slug if available
    const slugToDelete = extra?.slug || (!isUuid(slugOrId) ? slugOrId : undefined);
    if (slugToDelete) {
      const { error } = await supabase.from('products').delete().eq('slug', slugToDelete);
      if (error) console.error('[Supabase delete by slug error]:', error);
    }

    // 3. Delete by name if available
    if (extra?.name) {
      const { error } = await supabase.from('products').delete().eq('name', extra.name);
      if (error) console.error('[Supabase delete by name error]:', error);
    }
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
        primary_section_id,
        primary_category_id,
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
      cloud_id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      primary_section_id: p.primary_section_id || undefined,
      primary_category_id: p.primary_category_id || undefined,
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

