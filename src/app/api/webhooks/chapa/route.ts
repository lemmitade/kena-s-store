// ============================================================================
// CHAPA WEBHOOK HANDLER: /api/webhooks/chapa
// Idempotent processing, HMAC SHA256 signature verification, server confirmation
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyChapaWebhookSignature } from '@/lib/payments/chapa';
import { db, updateOrderStatus, getStoreSettings } from '@/lib/db/repository';
import { sendTelegramMessage, buildPaymentVerifiedAlert } from '@/lib/telegram/bot';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-chapa-signature');

    // 1. Signature Verification
    const isValidSignature = verifyChapaWebhookSignature(rawBody, signature);
    // If webhook secret is configured and signature does not match, reject
    if (process.env.CHAPA_WEBHOOK_SECRET && !isValidSignature) {
      return NextResponse.json({ error: 'Invalid HMAC signature.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const txRef = payload.tx_ref || payload.reference;
    const status = payload.status; // 'success', 'failed', 'pending'

    if (!txRef) {
      return NextResponse.json({ error: 'Missing transaction reference.' }, { status: 400 });
    }

    // 2. Locate Matching Order
    const order = db.orders.find((o) => o.order_number === txRef);
    if (!order) {
      // Idempotent ack so Chapa doesn't spam retries if order was processed or outside system
      return NextResponse.json({ received: true, note: 'Order not found in store.' }, { status: 200 });
    }

    // 3. Idempotency Check (prevent duplicate execution if already paid)
    if (order.payment_status === 'paid' && status === 'success') {
      return NextResponse.json({ received: true, note: 'Order already marked as paid.' }, { status: 200 });
    }

    // 4. Update Payment & Order Status
    if (status === 'success') {
      order.payment_status = 'paid';
      order.order_status = 'preparing';
      order.updated_at = new Date().toISOString();

      // Log in audit trail
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        staff_name: 'Chapa Webhook',
        action: 'payment_verified',
        resource_type: 'orders',
        resource_id: order.id,
        details: { txRef, amount: order.total_amount_etb },
        created_at: new Date().toISOString(),
      });

      // Send Telegram alert
      try {
        const settings = await getStoreSettings();
        const botToken = settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
        const chatId = settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
        const isEnabled = settings.telegram_notifications_enabled || Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

        if (isEnabled && botToken && chatId) {
          const msg = buildPaymentVerifiedAlert(order.order_number, order.total_amount_etb, txRef);
          await sendTelegramMessage(msg, botToken, chatId);
        }
      } catch {
        // notification errors must not fail webhook response
      }
    } else if (status === 'failed') {
      order.payment_status = 'failed';
      order.updated_at = new Date().toISOString();
    }

    return NextResponse.json({ received: true, status: order.payment_status }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
