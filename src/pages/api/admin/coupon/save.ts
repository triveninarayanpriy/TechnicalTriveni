import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk, flashRedirect, strField } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/coupons', { err: 'Session expired.' });

  const code = strField(form, 'code', 50)?.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!code) return flashRedirect('/admin/coupons', { err: 'Invalid code.' });

  const discount_pct = Number(form.get('discount_pct')) || 0;
  const discount_inr = Number(form.get('discount_inr')) || 0;
  const max_uses = Number(form.get('max_uses')) || 0;
  const expiresStr = strField(form, 'expires_at', 50);
  let expires_at = null;

  if (expiresStr) {
    const d = new Date(expiresStr);
    if (!isNaN(d.getTime())) expires_at = Math.floor(d.getTime() / 1000);
  }

  if (discount_pct === 0 && discount_inr === 0) {
    return flashRedirect('/admin/coupons', { err: 'Specify a discount amount.' });
  }

  try {
    await env.DB.prepare(
      'INSERT INTO coupons (code, discount_pct, discount_inr, max_uses, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(code, discount_pct, discount_inr, max_uses, expires_at, Math.floor(Date.now() / 1000)).run();
    return flashRedirect('/admin/coupons', { ok: 'Coupon created.' });
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) {
      return flashRedirect('/admin/coupons', { err: 'Coupon code already exists.' });
    }
    return flashRedirect('/admin/coupons', { err: 'Database error.' });
  }
};
