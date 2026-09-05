import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteBom } from '../../../../lib/db';
import { csrfOk, intField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });
  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/projects';
  if (id) await deleteBom(env.DB, id);
  return flashRedirect(back, { ok: 'Component removed.' });
};
