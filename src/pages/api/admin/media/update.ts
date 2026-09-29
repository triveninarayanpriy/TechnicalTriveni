import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateImageKind, syncProjectMedia } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return new Response('Forbidden', { status: 403 });
  
  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const kind = strField(form, 'kind', 50);
  
  if (id && kind) {
    await updateImageKind(env.DB, id, kind);
    if (kind === 'model' || kind === 'image' || kind === 'cover') {
       await syncProjectMedia(env.DB, projectId);
    }
  }
  return flashRedirect('/admin/projects/' + projectId, { ok: 'Media type updated.' });
};

