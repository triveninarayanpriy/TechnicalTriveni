import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrder, recordOrderResend } from '../../../../../lib/db';
import { csrfOk, adminResponse } from '../../../../../lib/admin';
import { sendEmail, buildOrderEmail } from '../../../../../lib/email';
import { rateLimit } from '../../../../../lib/auth';

export const POST: APIRoute = async ({ params, request, cookies, locals }) => {
  const id = params.id;
  if (!id) return adminResponse(request, '/admin/orders', { err: 'Order ID is required.' });

  // Verify CSRF
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

  const order = await getOrder(env.DB, id);
  if (!order) {
    return adminResponse(request, '/admin/orders', { err: 'Order not found.' });
  }

  if (order.status !== 'paid') {
    return adminResponse(request, '/admin/orders', { err: 'Cannot resend download email for unpaid or refunded order.' });
  }

  // Rate limit: 3 per order per hour
  const rl = await rateLimit(env, `resend:${order.id}`, 3, 3600);
  if (!rl.ok) {
    return adminResponse(request, '/admin/orders', { err: 'Rate limit reached: Maximum 3 resend emails per hour for this order.' });
  }

  // Also check DB timestamp rate limit if available
  if (order.last_resent_at && (order.resend_count || 0) >= 3) {
    const elapsed = (Date.now() - new Date(order.last_resent_at).getTime()) / 1000;
    if (elapsed < 3600) {
      return adminResponse(request, '/admin/orders', { err: 'Rate limit reached: Maximum 3 resend emails per hour for this order.' });
    }
  }

  let token = order.download_token;
  if (!token) {
    token = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare('UPDATE orders SET download_token = ? WHERE id = ?').bind(token, order.id).run();
  }

  const base = env.SITE_URL || new URL(request.url).origin;
  const downloadUrl = new URL(`/account/download?order=${order.id}&token=${token}`, base).toString();

  try {
    const { subject, html } = buildOrderEmail({ ...order, download_token: token }, downloadUrl);
    await sendEmail(env, { to: order.email, subject, html });
    const lastResentAt = await recordOrderResend(env.DB, order.id);

    return adminResponse(request, '/admin/orders', {
      ok: `Download email sent to ${order.email}`,
      data: { last_resent_at: lastResentAt }
    });
  } catch (e: any) {
    return adminResponse(request, '/admin/orders', { err: 'Failed to send email: ' + e.message });
  }
};
