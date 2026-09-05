import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addLink } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return flashRedirect('/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const label = strField(form, 'label', 120);
  const url = strField(form, 'url', 500);
  if (!label || !url) return flashRedirect(back, { err: 'Label and URL are required.' });

  await addLink(env.DB, {
    project_id: projectId,
    label,
    url,
    kind: strField(form, 'kind', 20) || 'other',
    sort: 0,
  });
  return flashRedirect(back, { ok: 'Link added.' });
};
