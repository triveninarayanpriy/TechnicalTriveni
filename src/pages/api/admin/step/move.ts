import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { moveStep } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });
  const projectId = intField(form, 'project_id', 0);
  const id = intField(form, 'id', 0);
  const dir = strField(form, 'dir', 4) === 'up' ? 'up' : 'down';
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/projects';
  if (id && projectId) await moveStep(env.DB, id, projectId, dir);
  return flashRedirect(back, { ok: 'Order updated.' });
};
