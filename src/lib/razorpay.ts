/**
 * Razorpay integration via the REST API (no Node-only SDK — works on Workers).
 * Docs: https://razorpay.com/docs/api/
 *
 * Security model:
 *  - Orders are created server-side; the amount is derived from the DB, never
 *    from the client, so a user cannot pay less than the listed price.
 *  - Payment authenticity is verified with an HMAC-SHA256 signature check.
 */
import { hmacSignHex, timingSafeEqual } from './crypto';

const API = 'https://api.razorpay.com/v1';

export function razorpayConfigured(env: Env): boolean {
  return (
    env.RAZORPAY_ENABLED === 'true' &&
    !!env.RAZORPAY_KEY_ID &&
    !!env.RAZORPAY_KEY_SECRET
  );
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/** Create a Razorpay order. `amountInr` is whole rupees; converted to paise. */
export async function createRazorpayOrder(
  env: Env,
  amountInr: number,
  receipt: string,
  notes: Record<string, string> = {},
): Promise<RazorpayOrder> {
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amountInr * 100), // paise
      currency: 'INR',
      receipt,
      notes,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${text}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/** Verify the checkout callback signature: HMAC(order_id|payment_id, secret). */
export async function verifyPaymentSignature(
  env: Env,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): Promise<boolean> {
  const expected = await hmacSignHex(env.RAZORPAY_KEY_SECRET, `${razorpayOrderId}|${razorpayPaymentId}`);
  return timingSafeEqual(expected, signature || '');
}

/** Verify a Razorpay webhook body signature (X-Razorpay-Signature header). */
export async function verifyWebhookSignature(
  env: Env,
  rawBody: string,
  signature: string,
): Promise<boolean> {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = await hmacSignHex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  return timingSafeEqual(expected, signature || '');
}
