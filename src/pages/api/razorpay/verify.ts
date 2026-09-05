import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrder, markOrderPaid } from '../../../lib/db';
import { verifyPaymentSignature } from '../../../lib/razorpay';
import { randomToken } from '../../../lib/crypto';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  let body: {
    orderId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return json({ error: 'Missing payment details.' }, 400);
  }

  const order = await getOrder(env.DB, orderId);
  if (!order) return json({ error: 'Order not found.' }, 404);

  // The Razorpay order id must match the one we created for this order.
  if (order.razorpay_order_id !== razorpay_order_id) {
    return json({ error: 'Order mismatch.' }, 400);
  }

  // Already paid → return the existing download link (idempotent).
  if (order.status === 'paid' && order.download_token) {
    return json({ redirect: `/account/download?order=${order.id}&token=${order.download_token}` });
  }

  const valid = await verifyPaymentSignature(env, razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) {
    return json({ error: 'Payment could not be verified.' }, 400);
  }

  const token = randomToken(32);
  await markOrderPaid(env.DB, order.id, razorpay_payment_id, razorpay_signature, token);

  return json({ redirect: `/account/download?order=${order.id}&token=${token}` });
};
