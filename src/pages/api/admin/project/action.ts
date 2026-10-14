import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateProject, deleteProject, getProjectById, moveImage, reorderMedia, syncProjectMedia } from '../../../../lib/db';
import { csrfOk, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const action = strField(form, 'action', 20);
  if (!id) return adminResponse(request, '/admin/projects', { err: 'Missing project.' });

  const project = await getProjectById(env.DB, id);
  if (!project) return adminResponse(request, '/admin/projects', { err: 'Project not found.' });

  switch (action) {
    case 'publish':
      await updateProject(env.DB, id, { published: 1 });
      return adminResponse(request, '/admin/projects', { ok: 'Published.' });
    case 'unpublish':
      await updateProject(env.DB, id, { published: 0 });
      return adminResponse(request, '/admin/projects', { ok: 'Moved to draft.' });
    case 'feature':
      await updateProject(env.DB, id, { featured: 1 });
      return adminResponse(request, '/admin/projects', { ok: 'Featured.' });
    case 'unfeature':
      await updateProject(env.DB, id, { featured: 0 });
      return adminResponse(request, '/admin/projects', { ok: 'Unfeatured.' });
    case 'moveup':
    case 'movedown': {
      const mediaId = intField(form, 'media_id', 0);
      if (mediaId) {
        await moveImage(env.DB, mediaId, id, action === 'moveup' ? 'up' : 'down');
        await syncProjectMedia(env.DB, id);
      }
      return adminResponse(request, `/admin/projects/${id}`, { ok: 'Order updated.' });
    }
    case 'reorder': {
      const mediaIdsStr = strField(form, 'media_ids', 2000);
      if (mediaIdsStr) {
        const ids = mediaIdsStr.split(',').map((x) => parseInt(x.trim(), 10)).filter(Number.isFinite);
        if (ids.length) {
          await reorderMedia(env.DB, id, ids);
          await syncProjectMedia(env.DB, id);
        }
      }
      return adminResponse(request, `/admin/projects/${id}`, { ok: 'Order updated.' });
    }
    case 'makefree':
      await updateProject(env.DB, id, { price_inr: 0, combo_enabled: 0 });
      return adminResponse(request, `/admin/projects/${id}`, { ok: 'This project is now completely free.' });
    case 'delete':
      await deleteProject(env.DB, id);
      return adminResponse(request, '/admin/projects', { ok: 'Project deleted.' });
    default:
      return adminResponse(request, '/admin/projects', { err: 'Unknown action.' });
  }
};
