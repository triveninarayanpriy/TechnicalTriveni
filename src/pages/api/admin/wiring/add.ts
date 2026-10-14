import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addWiringDiagram } from '../../../../lib/db';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return adminResponse(request, '/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const label = strField(form, 'label', 160);
  const module = strField(form, 'module', 100);
  let url = strField(form, 'url', 500);

  const file = form.get('file') as File | null;
  if (file && file.size > 0) {
    try {
      const up = await uploadToStore(env.BLOBS, file, `projects/${projectId}/wiring`);
      url = '/media/' + up.key;
    } catch (e: any) {
      return adminResponse(request, back, { err: 'File upload failed: ' + (e?.message || '') });
    }
  }

  if (!url) return adminResponse(request, back, { err: 'Wiring diagram image or URL is required.' });

  const id = await addWiringDiagram(env.DB, projectId, url, label || 'Wiring diagram', module);
  return adminResponse(request, back, { ok: 'Wiring diagram added.', data: { id, projectId, url, label, module } });
};
