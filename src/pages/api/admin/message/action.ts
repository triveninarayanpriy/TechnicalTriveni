import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { setMessageHandled, deleteMessage } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/messages', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const action = strField(form, 'action', 20);
  if (!id) return flashRedirect('/admin/messages', { err: 'Missing message.' });

  if (action === 'handle') await setMessageHandled(env.DB, id, 1);
  else if (action === 'unhandle') await setMessageHandled(env.DB, id, 0);
  else if (action === 'delete') await deleteMessage(env.DB, id);

  return flashRedirect('/admin/messages', { ok: 'Done.' });
};
