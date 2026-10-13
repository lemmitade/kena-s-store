'use server';

// ============================================================================
// SERVER ACTION: SEO MANAGEMENT & METATAGS
// ============================================================================

import { updateStoreSettings, getStoreSettings } from '@/lib/db/repository';
import { SeoSettings } from '@/types';
import { revalidatePath } from 'next/cache';

export async function updateSeoSettingsAction(seoData: SeoSettings) {
  try {
    const updated = await updateStoreSettings({
      seo_settings: seoData,
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/seo');

    return { success: true, settings: updated.seo_settings };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
