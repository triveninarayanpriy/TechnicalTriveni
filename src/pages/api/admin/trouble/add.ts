import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addTrouble } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });
  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return flashRedirect('/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const symptom = strField(form, 'symptom', 300);
  const fix = strField(form, 'fix', 600);
  if (!symptom || !fix) return flashRedirect(back, { err: 'Symptom and fix are required.' });

  await addTrouble(env.DB, { project_id: projectId, symptom, fix });
  return flashRedirect(back, { ok: 'Troubleshooting tip added.' });
};
