// ============================================================================
// TELEGRAM NOTIFICATIONS BOT & QUEUE DISPATCHER
// ============================================================================

import { Order, CompetitionResult } from '@/types';
import { formatETB } from '@/lib/utils/format';

export interface TelegramMessagePayload {
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2';
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const DEFAULT_BOT_TOKEN = '8900384234:AAGomXBQ1JQBmc_X4E5slxGbLJ1xk0IweoI';
const DEFAULT_GROUP_CHAT_ID = '-1003962170647';

/**
 * Sends a message directly to Telegram Bot API.
 */
export async function sendTelegramMessage(
  text: string,
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; error?: string }> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID || DEFAULT_GROUP_CHAT_ID;

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
      console.error('Telegram API error:', data);
      return { success: false, error: data.description || 'Telegram API returned not ok' };
    }
  } catch (err) {
    console.error('Telegram fetch exception:', err);
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
    ? `\n<b>Pickup Code:</b> <code>${escapeHtml(order.fulfillment?.pickup_reference_code || 'Pending')}</code>\n<b>Location:</b> ${escapeHtml(order.fulfillment?.pickup_location_name || 'Flagship Store')}`
    : `\n<b>Delivery Zone:</b> ${escapeHtml(order.fulfillment?.delivery_zone_name || 'N/A')}\n<b>Sub-City:</b> ${escapeHtml(order.fulfillment?.delivery_sub_city || 'Addis Ababa')}\n<b>Address:</b> ${escapeHtml(order.fulfillment?.delivery_address || '—')}`;

  const itemsList = order.items && order.items.length > 0
    ? order.items
        .map((i) => `• ${i.quantity}x ${escapeHtml(i.product_name)} (${escapeHtml(i.size || 'STD')}/${escapeHtml(i.color || 'STD')}) — ${formatETB(i.line_total_etb)}`)
        .join('\n')
    : 'No items details';

  const paymentMethod = escapeHtml((order.payment_method || 'PENDING').toUpperCase());
  const paymentStatus = escapeHtml((order.payment_status || 'PENDING').toUpperCase());

  return `
🛍️ <b>NEW ORDER RECEIVED: ${escapeHtml(order.order_number)}</b>
${fulfillmentTitle}

<b>Customer:</b> ${escapeHtml(order.customer_name)}
<b>Phone:</b> ${escapeHtml(order.customer_phone)}
${pickupInfo}

<b>Items:</b>
${itemsList}

<b>Financials:</b>
Subtotal: ${formatETB(order.subtotal_etb)}
${order.discount_amount_etb > 0 ? `Discount (${escapeHtml(order.applied_coupon_code || '')}): -${formatETB(order.discount_amount_etb)}\n` : ''}Fulfillment Fee: ${formatETB(order.delivery_fee_etb)}
<b>Total:</b> <b>${formatETB(order.total_amount_etb)}</b>
<b>Payment:</b> ${paymentMethod} (${paymentStatus})
`.trim();
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

export function buildBidPaymentAlert(
  competitionTitle: string,
  participantName: string,
  entryFeeETB: number,
  txRef: string
): string {
  return `
🎯 <b>COMPETITION ENTRY FEE PAID (CHAPA)</b>
<b>Competition:</b> ${escapeHtml(competitionTitle)}
<b>Participant:</b> ${escapeHtml(participantName)}
<b>Entry Fee:</b> ${formatETB(entryFeeETB)}
<b>Tx Ref:</b> <code>${txRef}</code>
<b>Status:</b> PAID & ELIGIBLE
`;
}

