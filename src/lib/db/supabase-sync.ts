import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Product } from '@/types';

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
