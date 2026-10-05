import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrder, markOrderPaid } from '../../../../lib/db';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { randomToken } from '../../../../lib/crypto';
import { sendEmail, buildOrderEmail } from '../../../../lib/email';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/orders', { err: 'Session expired.' });

  const id = strField(form, 'id', 50);
  const order = id ? await getOrder(env.DB, id) : null;

  if (order && order.status !== 'paid') {
    const token = randomToken();
    await markOrderPaid(env.DB, order.id, 'manual_grant', 'manual_grant', token);
    
    // Refresh to get new download token
    const paidOrder = await getOrder(env.DB, order.id);
    if (paidOrder) {
      const base = env.SITE_URL || new URL(request.url).origin;
      const url = new URL(`/account/download?order=${paidOrder.id}&token=${paidOrder.download_token}`, base).toString();
      try {
        const { subject, html } = buildOrderEmail(paidOrder, url);
        await sendEmail(env, { to: paidOrder.email, subject, html });
        return flashRedirect('/admin/orders', { ok: 'Manual access granted and email sent.' });
      } catch (e: any) {
        return flashRedirect('/admin/orders', { ok: 'Manual access granted, but email failed: ' + e.message });
      }
    }
  }

  return flashRedirect('/admin/orders', { err: 'Invalid order or already paid.' });
};
