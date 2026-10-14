'use server';

// ============================================================================
// SERVER ACTION: SECURE CHECKOUT SUBMISSION
// Re-validates variant stock, recalculates prices, prevents browser price manipulation
// ============================================================================

import { createOrder, CreateOrderInput, getStoreSettings } from '@/lib/db/repository';
import { sendTelegramMessage, buildNewOrderAlert } from '@/lib/telegram/bot';

export interface CheckoutResult {
  success: boolean;
  orderNumber?: string;
  trackingToken?: string;
  totalETB?: number;
  paymentMethod?: string;
  error?: string;
}

export async function processCheckoutAction(input: CreateOrderInput): Promise<CheckoutResult> {
  try {
    const result = await createOrder(input);

    if (!result.success || !result.order) {
      return {
        success: false,
        error: result.error || 'Checkout could not be completed.',
      };
    }

    const order = result.order;

    // Send Telegram alert in background if configured
    try {
      const settings = await getStoreSettings();
      const botToken = settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
      const isEnabled = settings.telegram_notifications_enabled || Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

      if (isEnabled && botToken && chatId) {
        const alertMsg = buildNewOrderAlert(order);
        await sendTelegramMessage(alertMsg, botToken, chatId);
      }
    } catch {
      // Notification errors must never abort the order
    }

    return {
      success: true,
      orderNumber: order.order_number,
      trackingToken: order.tracking_token,
      totalETB: order.total_amount_etb,
      paymentMethod: order.payment_method,
    };
  } catch (err) {
    return {
      success: false,
      error: `Server error during checkout: ${(err as Error).message}`,
    };
  }
}
