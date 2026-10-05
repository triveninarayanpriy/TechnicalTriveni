import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { hashPassword } from '../../../../lib/crypto';
import { getSetting } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/settings', { err: 'Session expired.' });

  const password = strField(form, 'password', 100);
  if (!password || password.length < 8) {
    return flashRedirect('/admin/settings', { err: 'Password must be at least 8 characters long.' });
  }

  const hash = await hashPassword(password);
  
  // Save to settings DB
  await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .bind('admin_password_hash', hash).run();

  return flashRedirect('/admin/settings', { ok: 'Password changed successfully.' });
};
