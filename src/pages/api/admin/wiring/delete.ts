import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteWiringDiagram } from '../../../../lib/db';
import { csrfOk, intField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/projects';
  if (!id) return adminResponse(request, back, { err: 'Missing wiring diagram.' });

  const row = await env.DB.prepare('SELECT url FROM project_wiring_diagrams WHERE id = ?').bind(id).first<{ url: string }>();
  await deleteWiringDiagram(env.DB, id);
  if (row?.url?.startsWith('/media/')) {
    const key = row.url.slice('/media/'.length);
    try { await env.BLOBS.delete(key); } catch { /* ignore */ }
  }
  return adminResponse(request, back, { ok: 'Wiring diagram removed.', data: { id, projectId } });
};
