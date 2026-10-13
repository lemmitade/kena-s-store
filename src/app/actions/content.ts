'use server';

// ============================================================================
// SERVER ACTIONS: HERO CAROUSEL & POPUP ADS CONTENT MANAGEMENT
// ============================================================================

import { updateStoreSettings, getStoreSettings } from '@/lib/db/repository';
import { HeroSlide, PopupAdSettings } from '@/types';
import { revalidatePath } from 'next/cache';

export async function updateHeroSlidesAction(slides: HeroSlide[]) {
  try {
    const updated = await updateStoreSettings({
      hero_slides: slides,
    });

    revalidatePath('/');
    revalidatePath('/admin/content/hero');

    return { success: true, slides: updated.hero_slides };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updatePopupAdAction(popupSettings: PopupAdSettings) {
  try {
    const updated = await updateStoreSettings({
      popup_ad: popupSettings,
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/marketing/pop-ads');

    return { success: true, popup_ad: updated.popup_ad };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
