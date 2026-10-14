import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateStep } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = `/admin/projects/${projectId}`;
  if (!id || !projectId) return adminResponse(request, back, { err: 'Missing ID.' });

  try {
    await updateStep(env.DB, id, {
      title: strField(form, 'title', 200),
      body: strField(form, 'body', 5000),
      why: strField(form, 'why', 500)
    });
    return adminResponse(request, back, { ok: 'Step updated.', data: { id, projectId } });
  } catch (e: any) {
    return adminResponse(request, back, { err: e?.message || 'Update failed.' });
  }
};
