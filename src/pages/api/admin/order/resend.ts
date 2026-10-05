import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrder } from '../../../../lib/db';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { sendEmail, buildOrderEmail } from '../../../../lib/email';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/orders', { err: 'Session expired.' });

  const id = strField(form, 'id', 50);
  const order = id ? await getOrder(env.DB, id) : null;

  if (order && order.status === 'paid' && order.download_token) {
    const base = env.SITE_URL || new URL(request.url).origin;
    const url = new URL(`/account/download?order=${order.id}&token=${order.download_token}`, base).toString();
    try {
      const { subject, html } = buildOrderEmail(order, url);
      await sendEmail(env, { to: order.email, subject, html });
      return flashRedirect('/admin/orders', { ok: 'Email sent.' });
    } catch (e: any) {
      return flashRedirect('/admin/orders', { err: 'Email error: ' + e.message });
    }
  }

  return flashRedirect('/admin/orders', { err: 'Invalid order or order not paid.' });
};
