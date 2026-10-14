import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updatePin } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = `/admin/projects/${projectId}`;
  if (!id || !projectId) return adminResponse(request, back, { err: 'Missing ID.' });

  try {
    await updatePin(env.DB, id, {
      from_pin: strField(form, 'from_pin', 50),
      to_pin: strField(form, 'to_pin', 50),
      note: strField(form, 'note', 200),
      module: strField(form, 'module', 100)
    });
    return adminResponse(request, back, { ok: 'Connection updated.', data: { id, projectId } });
  } catch (e: any) {
    return adminResponse(request, back, { err: e?.message || 'Update failed.' });
  }
};
