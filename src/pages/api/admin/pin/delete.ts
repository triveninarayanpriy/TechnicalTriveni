import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deletePin } from '../../../../lib/db';
import { csrfOk, intField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });
  const projectId = intField(form, 'project_id', 0);
  const id = intField(form, 'id', 0);
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/projects';
  if (id) await deletePin(env.DB, id);
  return adminResponse(request, back, { ok: 'Connection removed.', data: { id, projectId } });
};
