'use server';

// ============================================================================
// SERVER ACTIONS: DYNAMIC STORE SECTIONS & CATEGORIES MANAGEMENT
// ============================================================================

import { createSection, updateSection, db } from '@/lib/db/repository';
import { revalidatePath } from 'next/cache';

export async function createSectionAction(formData: {
  name: string;
  slug: string;
  description?: string;
  thumbnail_image_url?: string;
  display_order: number;
}) {
  try {
    const sec = await createSection({
      ...formData,
      is_nav_visible: true,
      is_home_visible: true,
      is_active: true,
      is_archived: false,
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/catalog/sections');

    return { success: true, section: sec };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function toggleSectionVisibilityAction(id: string, is_nav_visible: boolean) {
  try {
    const updated = await updateSection(id, { is_nav_visible });
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/catalog/sections');
    return { success: true, section: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
