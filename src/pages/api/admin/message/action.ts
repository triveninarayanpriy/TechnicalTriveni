import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateContactMessage, deleteMessage } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/messages', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const action = strField(form, 'action', 20);
  if (!id) return flashRedirect('/admin/messages', { err: 'Missing message.' });

  if (action === 'delete') {
    await deleteMessage(env.DB, id);
  } else if (['new', 'replied', 'spam', 'archived', 'archive'].includes(action)) {
    const status = action === 'archive' ? 'archived' : action;
    await updateContactMessage(env.DB, id, { status });
  }

  return flashRedirect('/admin/messages', { ok: 'Message updated.' });
};
