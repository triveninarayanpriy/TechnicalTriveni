import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrderByRazorpayId, markOrderPaid } from '../../../lib/db';
import { verifyWebhookSignature } from '../../../lib/razorpay';
import { randomToken } from '../../../lib/crypto';

/**
 * Razorpay webhook receiver. Configure in the Razorpay dashboard to point at
 * https://<your-domain>/api/razorpay/webhook with events:
 *   payment.captured, order.paid
 * and the same secret you set as RAZORPAY_WEBHOOK_SECRET.
 *
 * This is the authoritative, browser-independent confirmation of payment.
 */
export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('x-razorpay-signature') || '';
  const raw = await request.text();

  if (!(await verifyWebhookSignature(env, raw, signature))) {
    return new Response('invalid signature', { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('bad payload', { status: 400 });
  }

  const type = event?.event as string | undefined;
  if (type === 'payment.captured' || type === 'order.paid') {
    const rzpOrderId: string | undefined =
      event?.payload?.payment?.entity?.order_id || event?.payload?.order?.entity?.id;
    const paymentId: string = event?.payload?.payment?.entity?.id || '';

    if (rzpOrderId) {
      const order = await getOrderByRazorpayId(env.DB, rzpOrderId);
      if (order && order.status !== 'paid') {
        const token = order.download_token || randomToken(32);
        await markOrderPaid(env.DB, order.id, paymentId, 'webhook', token);
      }
    }
  }

  // Always 200 quickly so Razorpay doesn't retry unnecessarily.
  return new Response('ok', { status: 200 });
};
