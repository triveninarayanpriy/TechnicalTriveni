import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrder, recordOrderRefund } from '../../../../lib/db';
import { csrfOk, adminResponse } from '../../../../lib/admin';
import { refundRazorpayPayment } from '../../../../lib/razorpay';
import { sendEmail, buildRefundEmail } from '../../../../lib/email';
import { formatINR } from '../../../../lib/format';

export const POST: APIRoute = async ({ request, cookies }) => {
  let form: FormData | null = null;
  let jsonBody: any = null;
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try { jsonBody = await request.json(); } catch {}
  } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    try { form = await request.formData(); } catch {}
  }

  const submittedCsrf = jsonBody?.csrf || form?.get('csrf') || request.headers.get('x-csrf-token');
  if (!csrfOk(cookies, submittedCsrf ? String(submittedCsrf) : form, request)) {
    return adminResponse(request, '/admin/orders', { err: 'Session expired or invalid CSRF token.' });
  }

  const id = String(jsonBody?.id || jsonBody?.order_id || form?.get('id') || form?.get('order_id') || '').trim();
  if (!id) return adminResponse(request, '/admin/orders', { err: 'Order ID is required.' });

  const order = await getOrder(env.DB, id);
  if (!order) return adminResponse(request, '/admin/orders', { err: 'Order not found.' });
  if (order.status === 'refunded') return adminResponse(request, '/admin/orders', { err: 'This order is already refunded.' });
  if (order.status !== 'paid') return adminResponse(request, '/admin/orders', { err: 'Only paid orders can be refunded.' });

  // Safety check: NEVER refund live payments in test/dev environment
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
    return adminResponse(request, '/admin/orders', { err: 'Refunding live payments is prohibited in this environment.' });
  }

  let refundId = '';
  try {
    const paymentId = order.razorpay_payment_id;
    const res = await refundRazorpayPayment(env, paymentId, order.amount_inr);
    refundId = res?.id || ('rfnd_' + Date.now());

    const isoNow = await recordOrderRefund(env.DB, order.id, refundId);

    // Optionally notify customer by email
    try {
      const { subject, html } = buildRefundEmail(order, refundId);
      await sendEmail(env, { to: order.email, subject, html });
    } catch {}

    const amountFormatted = formatINR(order.amount_inr);
    return adminResponse(request, '/admin/orders', {
      ok: `Refund of ${amountFormatted} to ${order.email} completed.`,
      data: {
        refund_id: refundId,
        refunded_at: isoNow,
        status: 'refunded',
      },
    });
  } catch (e: any) {
    return adminResponse(request, '/admin/orders', { err: 'Refund failed: ' + e.message });
  }
};
