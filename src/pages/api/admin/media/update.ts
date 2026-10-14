import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateImageKind, syncProjectMedia } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });
  
  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const kind = strField(form, 'kind', 50);
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/projects';
  
  if (id && kind) {
    await updateImageKind(env.DB, id, kind);
    if (kind === 'model' || kind === 'image' || kind === 'cover') {
       await syncProjectMedia(env.DB, projectId);
    }
  }
  return adminResponse(request, back, { ok: 'Media type updated.', data: { id, kind, projectId } });
};

