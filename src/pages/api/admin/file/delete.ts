import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getFileById, deleteFile } from '../../../../lib/db';
import { csrfOk, intField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/projects';
  if (!id) return flashRedirect(back, { err: 'Missing file.' });

  const file = await getFileById(env.DB, id);
  await deleteFile(env.DB, id);
  if (file?.r2_key) {
    try { await env.FILES.delete(file.r2_key); } catch { /* ignore */ }
  }
  return flashRedirect(back, { ok: 'File removed.' });
};
