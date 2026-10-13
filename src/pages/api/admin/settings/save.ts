import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { setSetting } from '../../../../lib/db';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';

const ALLOWED = ['site_announcement', 'contact_email', 'announcement_link', 'announcement_expiry', 'test_emails', 'announcement_enabled'];

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/settings', { err: 'Session expired.' });

  await setSetting(env.DB, 'announcement_enabled', form.get('announcement_enabled') === '1' ? '1' : '0');

  if (form.has('gemini_api_key')) {
    const keyVal = strField(form, 'gemini_api_key', 200);
    if (keyVal && !keyVal.includes('•••')) {
      await setSetting(env.DB, 'gemini_api_key', keyVal);
    }
  }

  for (const key of ALLOWED) {
    if (key === 'announcement_enabled') continue;
    if (form.has(key)) {
      await setSetting(env.DB, key, strField(form, key, 500));
    }
  }
  return flashRedirect('/admin/settings', { ok: 'Settings saved.' });
};
