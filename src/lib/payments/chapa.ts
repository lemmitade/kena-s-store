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

  const isV2 = secret.startsWith('CHAPA_');

  if (isV2) {
    const payload = {
      amount: Math.round(req.amount * 100), // Chapa v2 expects amount in cents
      currency: req.currency || 'ETB',
      merchant_reference: req.tx_ref.slice(0, 20),
      customer: {
        email: req.email || `${req.tx_ref.toLowerCase()}@customer.yourbrand.et`,
        first_name: req.first_name,
        last_name: req.last_name || '',
        phone_number: req.phone_number,
      },
      customization: {
        title: req.customization?.title || 'YOUR BRAND Order',
        description: req.customization?.description || `Order payment for ${req.tx_ref}`,
      },
      callback_url: req.callback_url,
      return_url: req.return_url,
    };

    try {
      const res = await fetch('https://api.chapa.global/v2/payments/hosted', {
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
        message: `Failed to connect to Chapa v2 API: ${(error as Error).message}`,
      };
    }
  }

  // Fallback for Chapa v1 API keys (CHASECK_...)
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

  const isV2 = secret.startsWith('CHAPA_');

  if (isV2) {
    try {
      const res = await fetch(`https://api.chapa.global/v2/payments/${txRef}/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data && data.data) {
        const v2Data = data.data;
        const normalizedStatus = String(v2Data.status || '').toLowerCase();
        return {
          status: data.status === 'success' ? 'success' : 'failed',
          message: data.message,
          data: {
            first_name: v2Data.customer?.first_name || '',
            last_name: v2Data.customer?.last_name || '',
            email: v2Data.customer?.email || '',
            currency: v2Data.currency || 'ETB',
            amount: typeof v2Data.amount === 'number' ? v2Data.amount / 100 : Number(v2Data.amount) / 100,
            charge: v2Data.service_fee ? v2Data.service_fee / 100 : 0,
            mode: 'live',
            method: v2Data.payment_method || '',
            type: 'hosted',
            status: normalizedStatus === 'success' ? 'success' : normalizedStatus === 'failed' ? 'failed' : 'pending',
            reference: v2Data.chapa_reference || txRef,
            tx_ref: v2Data.merchant_reference || txRef,
            customization: {},
            created_at: v2Data.created_at || '',
            updated_at: v2Data.updated_at || '',
          },
        };
      }
      return data;
    } catch (error) {
      return {
        status: 'failed',
        message: `Verification request failed: ${(error as Error).message}`,
      };
    }
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
  if (!signatureHeader) {
    return false;
  }

  const cleanHeader = signatureHeader.trim();
  const secretsToTry = [
    webhookSecret,
    process.env.CHAPA_WEBHOOK_SECRET,
    process.env.CHAPA_SECRET_KEY,
  ].filter((s): s is string => Boolean(s && !s.includes('xxxxxxxx')));

  for (const secret of secretsToTry) {
    try {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const hashBuf = Buffer.from(hash, 'utf8');
      const sigBuf = Buffer.from(cleanHeader, 'utf8');

      if (hashBuf.length === sigBuf.length && crypto.timingSafeEqual(hashBuf, sigBuf)) {
        return true;
      }
    } catch {
      // try next secret candidate
    }
  }

  return false;
}
