import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateTrouble } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = `/admin/projects/${projectId}`;
  if (!id || !projectId) return adminResponse(request, back, { err: 'Missing ID.' });

  try {
    await updateTrouble(env.DB, id, {
      symptom: strField(form, 'symptom', 300),
      cause: strField(form, 'cause', 600),
      fix: strField(form, 'fix', 2000)
    });
    return adminResponse(request, back, { ok: 'Tip updated.', data: { id, projectId } });
  } catch (e: any) {
    return adminResponse(request, back, { err: e?.message || 'Update failed.' });
  }
};
