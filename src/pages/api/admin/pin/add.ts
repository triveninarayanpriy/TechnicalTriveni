import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addPin } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });
  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return adminResponse(request, '/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const from_pin = strField(form, 'from_pin', 80);
  const to_pin = strField(form, 'to_pin', 80);
  if (!from_pin || !to_pin) return adminResponse(request, back, { err: 'Both pins are required.' });

  const id = await addPin(env.DB, { project_id: projectId, from_pin, to_pin, note: strField(form, 'note', 200) });
  return adminResponse(request, back, { ok: 'Connection added.', data: { id, projectId } });
};
