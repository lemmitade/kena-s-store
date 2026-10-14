// ============================================================================
// TELEGRAM NOTIFICATIONS BOT & QUEUE DISPATCHER
// ============================================================================

import { Order, CompetitionResult } from '@/types';
import { formatETB } from '@/lib/utils/format';

export interface TelegramMessagePayload {
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2';
}

/**
 * Sends a message directly to Telegram Bot API.
 */
export async function sendTelegramMessage(
  text: string,
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; error?: string }> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat || token.includes('ABCdef')) {
    return {
      success: false,
      error: 'Telegram Bot Token or Chat ID is not configured.',
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.description || 'Telegram API returned not ok' };
    }
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Builders for structured operational alerts:
 */
export function buildNewOrderAlert(order: Order): string {
  const isPickup = order.fulfillment_type === 'store_pickup';
  const fulfillmentTitle = isPickup ? '🏬 <b>STORE PICKUP ORDER</b>' : '🚚 <b>HOME DELIVERY ORDER</b>';
  const pickupInfo = isPickup
    ? `\n<b>Pickup Code:</b> <code>${order.fulfillment?.pickup_reference_code || 'Pending'}</code>\n<b>Location:</b> ${order.fulfillment?.pickup_location_name || 'Flagship Store'}`
    : `\n<b>Delivery Zone:</b> ${order.fulfillment?.delivery_zone_name || 'N/A'}\n<b>Sub-City:</b> ${order.fulfillment?.delivery_sub_city || 'Addis Ababa'}\n<b>Address:</b> ${order.fulfillment?.delivery_address || '—'}`;

  const itemsList = order.items
    ? order.items
        .map((i) => `• ${i.quantity}x ${i.product_name} (${i.size || 'STD'}/${i.color || 'STD'}) — ${formatETB(i.line_total_etb)}`)
        .join('\n')
    : 'No items details';

  return `
🛍️ <b>NEW ORDER RECEIVED: ${order.order_number}</b>
${fulfillmentTitle}

<b>Customer:</b> ${order.customer_name}
<b>Phone:</b> ${order.customer_phone}
${pickupInfo}

<b>Items:</b>
${itemsList}

<b>Financials:</b>
Subtotal: ${formatETB(order.subtotal_etb)}
${order.discount_amount_etb > 0 ? `Discount (${order.applied_coupon_code}): -${formatETB(order.discount_amount_etb)}\n` : ''}Fulfillment Fee: ${formatETB(order.delivery_fee_etb)}
<b>Total:</b> <b>${formatETB(order.total_amount_etb)}</b>
<b>Payment:</b> ${order.payment_method.toUpperCase()} (${order.payment_status.toUpperCase()})
`;
}

export function buildPaymentVerifiedAlert(orderNumber: string, amountETB: number, txRef: string): string {
  return `
✅ <b>ONLINE PAYMENT VERIFIED (CHAPA)</b>
<b>Order:</b> ${orderNumber}
<b>Amount:</b> ${formatETB(amountETB)}
<b>Tx Ref:</b> <code>${txRef}</code>
<b>Status:</b> PAID & CONFIRMED
`;
}

export function buildLowStockAlert(productName: string, sku: string, currentStock: number, threshold: number): string {
  return `
⚠️ <b>LOW INVENTORY WARNING</b>
<b>Product:</b> ${productName}
<b>SKU:</b> <code>${sku}</code>
<b>Remaining Stock:</b> <b>${currentStock} units</b> (Threshold: ${threshold})
Action required: Restock or adjust catalog variant.
`;
}

export function buildWinnerAnnouncementAlert(
  competitionTitle: string,
  winnerName: string,
  winningBidAmountETB: number,
  totalEntries: number
): string {
  return `
🏆 <b>COMPETITION RESULT VERIFIED & APPROVED</b>
<b>Competition:</b> ${competitionTitle}
<b>Verified Winner:</b> ${winnerName}
<b>Winning Unique Lowest Bid:</b> <b>${formatETB(winningBidAmountETB)}</b>
<b>Total Entries Evaluated:</b> ${totalEntries}

<i>Result has been verified by store administration.</i>
`;
}
