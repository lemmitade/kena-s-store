// ============================================================================
// CHAPA PAYMENT GATEWAY INTEGRATION (SERVER-SIDE & WEBHOOK VERIFICATION)
// ============================================================================

import crypto from 'crypto';

export interface ChapaInitializeRequest {
  amount: number;
  currency?: string;
  email?: string;
  first_name: string;
  last_name?: string;
  phone_number: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  customization?: {
    title?: string;
    description?: string;
  };
}

export interface ChapaInitializeResponse {
  status: 'success' | 'failed';
  message: string;
  data?: {
    checkout_url: string;
  };
}

export interface ChapaVerifyResponse {
  status: 'success' | 'failed';
  message: string;
  data?: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: number;
    charge: number;
    mode: string;
    method: string;
    type: string;
    status: 'success' | 'failed' | 'pending';
    reference: string;
    tx_ref: string;
    customization: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Initiates a Chapa payment transaction on the server.
 */
export async function initializeChapaPayment(
  req: ChapaInitializeRequest,
  secretKey?: string
): Promise<ChapaInitializeResponse> {
  const secret = secretKey || process.env.CHAPA_SECRET_KEY;
  if (!secret || secret.includes('xxxxxxxx')) {
    return {
      status: 'failed',
      message:
        'Chapa Secret Key is not configured. Please add CHAPA_SECRET_KEY in store settings or .env before accepting online payments.',
    };
  }

  const payload = {
    amount: req.amount.toString(),
    currency: req.currency || 'ETB',
    email: req.email || `${req.tx_ref.toLowerCase()}@customer.yourbrand.et`,
    first_name: req.first_name,
    last_name: req.last_name || '',
    phone_number: req.phone_number,
    tx_ref: req.tx_ref,
    callback_url: req.callback_url,
    return_url: req.return_url,
    'customization[title]': req.customization?.title || 'YOUR BRAND Order',
    'customization[description]': req.customization?.description || `Order payment for ${req.tx_ref}`,
  };

  try {
    const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return {
      status: 'failed',
      message: `Failed to connect to Chapa API: ${(error as Error).message}`,
    };
  }
}

/**
 * Server-side verification of transaction status directly with Chapa.
 */
export async function verifyChapaTransaction(
  txRef: string,
  secretKey?: string
): Promise<ChapaVerifyResponse> {
  const secret = secretKey || process.env.CHAPA_SECRET_KEY;
  if (!secret || secret.includes('xxxxxxxx')) {
    return {
      status: 'failed',
      message: 'Chapa Secret Key is not configured.',
    };
  }

  try {
    const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return {
      status: 'failed',
      message: `Verification request failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Verifies Chapa Webhook HMAC signature to guarantee authenticity.
 */
export function verifyChapaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.CHAPA_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) {
    return false;
  }

  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
