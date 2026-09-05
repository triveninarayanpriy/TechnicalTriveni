import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteImage } from '../../../../lib/db';
import { csrfOk, intField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/projects';
  if (!id) return flashRedirect(back, { err: 'Missing image.' });

  // Fetch the row to see if it points at our own MEDIA bucket, then clean it up.
  const row = await env.DB.prepare('SELECT url FROM project_images WHERE id = ?').bind(id).first<{ url: string }>();
  await deleteImage(env.DB, id);
  if (row?.url?.startsWith('/media/')) {
    const key = row.url.slice('/media/'.length);
    try { await env.BLOBS.delete(key); } catch { /* ignore */ }
  }
  return flashRedirect(back, { ok: 'Image removed.' });
};
