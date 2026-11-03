'use server';

// ============================================================================
// SERVER ACTIONS: ORDER MANAGEMENT & AUDITED FEE OVERRIDES
// ============================================================================

import { updateOrderStatus, overrideOrderDeliveryFee, getAllOrders, getStoreSettings } from '@/lib/db/repository';
import { OrderStatus, PaymentStatus } from '@/types';
import { sendTelegramMessage, buildPaymentVerifiedAlert } from '@/lib/telegram/bot';
import { revalidatePath } from 'next/cache';

export async function fetchOrdersAction() {
  try {
    const orders = await getAllOrders();
    return { success: true, orders };
  } catch (err) {
    return { success: false, error: (err as Error).message, orders: [] };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  newPaymentStatus?: PaymentStatus
) {
  try {
    const updated = await updateOrderStatus(orderId, newStatus, newPaymentStatus);

    if (updated && newPaymentStatus === 'paid') {
      try {
        const settings = await getStoreSettings();
        const botToken = settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
        const isEnabled = settings.telegram_notifications_enabled ?? true;
        if (isEnabled && botToken && chatId) {
          const msg = buildPaymentVerifiedAlert(updated, updated.total_amount_etb, updated.order_number);
          void sendTelegramMessage(msg, botToken, chatId);
        }
      } catch (err) {
        console.warn('[Admin payment confirmation telegram alert error]:', err);
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    return { success: true, order: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function overrideFeeAction(formData: {
  orderId: string;
  newFeeETB: number;
  reason: string;
  staffName: string;
}) {
  try {
    if (!formData.reason.trim()) {
      return { success: false, error: 'A valid reason is required for fee overrides.' };
    }

    const updated = await overrideOrderDeliveryFee(
      formData.orderId,
      formData.newFeeETB,
      formData.reason.trim(),
      formData.staffName
    );

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    return { success: true, order: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
