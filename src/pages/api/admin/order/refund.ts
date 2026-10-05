import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrder, refundOrder } from '../../../../lib/db';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { refundRazorpayPayment } from '../../../../lib/razorpay';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/orders', { err: 'Session expired.' });

  const id = strField(form, 'id', 50);
  const order = id ? await getOrder(env.DB, id) : null;

  if (order && order.status === 'paid' && order.razorpay_payment_id) {
    if (order.razorpay_payment_id === 'manual_grant') {
      await refundOrder(env.DB, order.id);
      return flashRedirect('/admin/orders', { ok: 'Manual order revoked.' });
    }
    
    try {
      await refundRazorpayPayment(env, order.razorpay_payment_id);
      await refundOrder(env.DB, order.id);
      return flashRedirect('/admin/orders', { ok: 'Refunded via Razorpay successfully.' });
    } catch (e: any) {
      return flashRedirect('/admin/orders', { err: e.message });
    }
  }

  return flashRedirect('/admin/orders', { err: 'Invalid order or already refunded.' });
};
