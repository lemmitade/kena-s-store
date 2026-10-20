// ============================================================================
// CHAPA WEBHOOK HANDLER: /api/webhooks/chapa
// Idempotent processing, HMAC SHA256 signature verification, server confirmation
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyChapaWebhookSignature } from '@/lib/payments/chapa';
import {
  db,
  getOrderByNumber,
  saveStoreState,
  getStoreSettings,
  getCompetitionEntryByRef,
  markCompetitionEntryPaid,
} from '@/lib/db/repository';
import { syncOrderToSupabase } from '@/lib/db/supabase-sync';
import {
  sendTelegramMessage,
  buildPaymentVerifiedAlert,
  buildBidPaymentAlert,
} from '@/lib/telegram/bot';

export async function GET() {
  return NextResponse.json(
    {
      status: 'active',
      gateway: 'chapa',
      endpoint: 'https://kenasstore.com/api/webhooks/chapa',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-chapa-signature') ||
      request.headers.get('chapa-signature') ||
      request.headers.get('x-chapa-signature-256');

    // 1. Signature Verification
    const hasSecret = Boolean(process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY);
    const isValidSignature = verifyChapaWebhookSignature(rawBody, signature);

    // If webhook secret or secret key is configured and signature does not match, reject
    if (hasSecret && !isValidSignature) {
      console.warn('[Chapa Webhook Error]: Invalid HMAC signature header:', signature);
      return NextResponse.json({ error: 'Invalid HMAC signature.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const txRef =
      payload.merchant_reference ||
      payload.tx_ref ||
      payload.reference ||
      payload.trx_ref ||
      payload.chapa_reference;
    const normalizedStatus = String(payload.status || '').toLowerCase();
    const isSuccess =
      normalizedStatus === 'success' ||
      payload.event === 'charge.success' ||
      payload.event === 'payment.success';
    const isFailed =
      normalizedStatus === 'failed' ||
      payload.event === 'charge.failed' ||
      payload.event === 'payment.failed';

    if (!txRef) {
      return NextResponse.json({ error: 'Missing transaction reference.' }, { status: 400 });
    }

    // 2. Locate Matching Order or Competition Bid Entry
    const order = await getOrderByNumber(txRef);
    if (!order) {
      // Check if it is a Competition Bid Entry
      const entry = await getCompetitionEntryByRef(txRef);
      if (entry) {
        if (entry.payment_status === 'paid' && isSuccess) {
          return NextResponse.json({ received: true, note: 'Bid entry already marked as paid.' }, { status: 200 });
        }

        if (isSuccess) {
          const markRes = await markCompetitionEntryPaid(txRef);
          // Send Telegram Alert for Competition Bid Entry
          try {
            const settings = await getStoreSettings();
            const botToken = settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
            const chatId = settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
            const isEnabled =
              settings.telegram_notifications_enabled ||
              Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

            if (isEnabled && botToken && chatId && markRes.entry) {
              const msg = buildBidPaymentAlert(
                markRes.competition?.title || 'Exclusive Competition',
                markRes.entry.participant_name,
                markRes.entry.entry_fee_etb,
                txRef
              );
              await sendTelegramMessage(msg, botToken, chatId);
            }
          } catch {
            // notification error must not fail webhook response
          }
        }
        return NextResponse.json(
          { received: true, type: 'competition_entry', status: isSuccess ? 'paid' : 'failed' },
          { status: 200 }
        );
      }

      // Idempotent ack so Chapa doesn't spam retries if reference was processed or outside system
      return NextResponse.json({ received: true, note: 'Reference not found in store.' }, { status: 200 });
    }

    // 3. Idempotency Check (prevent duplicate execution if already paid)
    if (order.payment_status === 'paid' && isSuccess) {
      return NextResponse.json({ received: true, note: 'Order already marked as paid.' }, { status: 200 });
    }

    // 4. Update Payment & Order Status
    if (isSuccess) {
      order.payment_status = 'paid';
      order.order_status = 'preparing';
      order.updated_at = new Date().toISOString();

      // Persist to local JSON state & sync to Supabase PostgreSQL
      saveStoreState(db);
      await syncOrderToSupabase(order);

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
    } else if (isFailed) {
      order.payment_status = 'failed';
      order.updated_at = new Date().toISOString();
      saveStoreState(db);
      await syncOrderToSupabase(order);
    }

    return NextResponse.json({ received: true, status: order.payment_status }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
