'use server';

// ============================================================================
// SERVER ACTION: SECURE CHECKOUT SUBMISSION
// Re-validates variant stock, recalculates prices, prevents browser price manipulation
// ============================================================================

import { createOrder, CreateOrderInput, getStoreSettings } from '@/lib/db/repository';
import { sendTelegramMessage, buildNewOrderAlert } from '@/lib/telegram/bot';
import { initializeChapaPayment } from '@/lib/payments/chapa';
import { revalidatePath } from 'next/cache';

export interface CheckoutResult {
  success: boolean;
  orderNumber?: string;
  trackingToken?: string;
  totalETB?: number;
  paymentMethod?: string;
  checkoutUrl?: string;
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
      const isEnabled = settings.telegram_notifications_enabled ?? true;

      if (isEnabled) {
        const alertMsg = buildNewOrderAlert(order);
        const sendResult = await sendTelegramMessage(alertMsg, botToken, chatId);
        if (!sendResult.success) {
          console.error('[Checkout Telegram Notification] Delivery failed:', sendResult.error);
        } else {
          console.log('[Checkout Telegram Notification] Delivered order alert for', order.order_number);
        }
      }
    } catch (notifErr) {
      console.error('[Checkout Telegram Notification] Unexpected error:', notifErr);
    }

    // Revalidate paths so Orders & Dispatch table displays the new order immediately
    try {
      revalidatePath('/admin/orders');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin');
      revalidatePath('/order-confirmation/[orderNumber]', 'page');
    } catch {
      // ignore in tests
    }

    let checkoutUrl: string | undefined;
    if (order.payment_method === 'chapa') {
      try {
        const nameParts = (order.customer_name || 'Customer').trim().split(/\s+/);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kenasstore.com';
        const chapaRes = await initializeChapaPayment({
          amount: order.total_amount_etb,
          currency: 'ETB',
          email: order.customer_email || `${order.order_number.toLowerCase()}@kenasstore.com`,
          first_name: nameParts[0] || 'Customer',
          last_name: nameParts.slice(1).join(' ') || 'Shopper',
          phone_number: order.customer_phone,
          tx_ref: order.order_number,
          callback_url: `${baseUrl}/api/webhooks/chapa`,
          return_url: `${baseUrl}/order-confirmation/${order.order_number}?token=${order.tracking_token}`,
          customization: {
            title: 'Kena Store Order',
            description: `Payment for Order #${order.order_number}`,
          },
        });

        if (chapaRes.status === 'success' && chapaRes.data?.checkout_url) {
          checkoutUrl = chapaRes.data.checkout_url;
        } else if (chapaRes.message) {
          console.warn('[Chapa initialize warning]:', chapaRes.message);
        }
      } catch (chapaErr) {
        console.error('[Chapa initialize error]:', chapaErr);
      }
    }

    return {
      success: true,
      orderNumber: order.order_number,
      trackingToken: order.tracking_token,
      totalETB: order.total_amount_etb,
      paymentMethod: order.payment_method,
      checkoutUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: `Server error during checkout: ${(err as Error).message}`,
    };
  }
}
