'use server';

// ============================================================================
// SERVER ACTIONS: STORE SETTINGS, PAYMENTS & LOGISTICS
// ============================================================================

import {
  updateStoreSettings,
  updateDeliveryZone,
  createDeliveryZone,
  updatePickupLocation,
  createPickupLocation,
  getStoreSettings,
} from '@/lib/db/repository';
import { StoreSettings } from '@/types';
import { sendTelegramMessage } from '@/lib/telegram/bot';
import { revalidatePath } from 'next/cache';

export async function testTelegramConnectionAction(token?: string, chatId?: string) {
  try {
    const settings = await getStoreSettings();
    const activeToken = token?.trim() || settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const activeChatId = chatId?.trim() || settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

    if (!activeToken || !activeChatId) {
      return {
        success: false,
        error: 'Please enter both the Telegram Bot Token and Destination Chat ID before testing.',
      };
    }

    const testText = `🔔 <b>KENA STORE — BOT CONNECTION TEST</b>\n\n✅ <b>Success!</b> Your Telegram operational bot is now connected to <b>${settings.store_name || 'Kena Store'}</b>.\n\nYou will receive real-time alerts whenever a customer places an order, completes Chapa payment, or a competition winner is approved.`;

    const res = await sendTelegramMessage(testText, activeToken, activeChatId);
    return res;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}


export async function updateStoreSettingsAction(data: Partial<StoreSettings>) {
  try {
    const updated = await updateStoreSettings(data);
    revalidatePath('/');
    revalidatePath('/admin/settings/store');
    revalidatePath('/admin/settings/payments');
    return { success: true, settings: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function saveDeliveryZoneAction(data: {
  id?: string;
  name: string;
  description?: string;
  fee_etb: number;
  free_delivery_threshold_etb?: number;
  estimated_delivery_time: string;
}) {
  try {
    if (data.id) {
      await updateDeliveryZone(data.id, data);
    } else {
      await createDeliveryZone({
        name: data.name,
        description: data.description,
        fee_etb: data.fee_etb,
        free_delivery_threshold_etb: data.free_delivery_threshold_etb,
        min_order_amount_etb: 0,
        estimated_delivery_time: data.estimated_delivery_time,
        priority: 5,
        is_active: true,
      });
    }

    revalidatePath('/checkout');
    revalidatePath('/delivery');
    revalidatePath('/admin/settings/delivery');
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function savePickupLocationAction(data: {
  id?: string;
  name: string;
  address_line: string;
  opening_hours: string;
  contact_phone: string;
  instructions?: string;
}) {
  try {
    if (data.id) {
      await updatePickupLocation(data.id, data);
    } else {
      await createPickupLocation({
        name: data.name,
        address_line: data.address_line,
        city: 'Addis Ababa',
        contact_phone: data.contact_phone,
        opening_hours: data.opening_hours,
        instructions: data.instructions,
        pickup_fee_etb: 0,
        is_active: true,
        accepts_new_orders: true,
        display_order: 1,
      });
    }

    revalidatePath('/checkout');
    revalidatePath('/delivery');
    revalidatePath('/admin/settings/pickup-locations');
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
