import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/coupons', { err: 'Session expired.' });

  const id = Number(form.get('id')) || 0;
  if (!id) return flashRedirect('/admin/coupons', { err: 'Invalid ID.' });

  await env.DB.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();
  
  return flashRedirect('/admin/coupons', { ok: 'Coupon deleted.' });
};
