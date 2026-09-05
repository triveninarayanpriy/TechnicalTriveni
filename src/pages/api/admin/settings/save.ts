import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { setSetting } from '../../../../lib/db';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';

const ALLOWED = ['site_announcement', 'contact_email'];

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/settings', { err: 'Session expired.' });

  for (const key of ALLOWED) {
    if (form.has(key)) {
      await setSetting(env.DB, key, strField(form, key, 500));
    }
  }
  return flashRedirect('/admin/settings', { ok: 'Settings saved.' });
};
