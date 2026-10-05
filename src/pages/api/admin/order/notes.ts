import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateOrderNotes } from '../../../../lib/db';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/orders', { err: 'Session expired.' });

  const id = strField(form, 'id', 50);
  const notes = strField(form, 'notes', 2000);

  if (id) {
    await updateOrderNotes(env.DB, id, notes);
  }

  return flashRedirect('/admin/orders', { ok: 'Notes saved.' });
};
