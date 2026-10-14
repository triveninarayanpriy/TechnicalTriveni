import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addLink } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return adminResponse(request, '/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const label = strField(form, 'label', 120);
  const url = strField(form, 'url', 500);
  if (!label || !url) return adminResponse(request, back, { err: 'Label and URL are required.' });

  const id = await addLink(env.DB, {
    project_id: projectId,
    label,
    url,
    kind: strField(form, 'kind', 20) || 'other',
    sort: 0,
  });
  return adminResponse(request, back, { ok: 'Link added.', data: { id, projectId, label, url } });
};
