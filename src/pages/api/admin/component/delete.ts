import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteComponent } from '../../../../lib/db';
import { csrfOk, intField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/components', { err: 'Session expired.' });
  const id = intField(form, 'id', 0);
  if (id) await deleteComponent(env.DB, id);
  return flashRedirect('/admin/components', { ok: 'Component removed (BOM rows kept their last values).' });
};
