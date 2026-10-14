import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addTrouble } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });
  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return adminResponse(request, '/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const symptom = strField(form, 'symptom', 300);
  const cause = strField(form, 'cause', 600);
  const fix = strField(form, 'fix', 1000);
  if (!symptom || !fix) return adminResponse(request, back, { err: 'Symptom and fix are required.' });

  const id = await addTrouble(env.DB, { project_id: projectId, symptom, cause, fix });
  return adminResponse(request, back, { ok: 'Troubleshooting tip added.', data: { id, projectId } });
};
