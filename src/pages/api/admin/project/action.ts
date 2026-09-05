import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateProject, deleteProject, getProjectById } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const action = strField(form, 'action', 20);
  if (!id) return flashRedirect('/admin/projects', { err: 'Missing project.' });

  const project = await getProjectById(env.DB, id);
  if (!project) return flashRedirect('/admin/projects', { err: 'Project not found.' });

  switch (action) {
    case 'publish':
      await updateProject(env.DB, id, { published: 1 });
      return flashRedirect('/admin/projects', { ok: 'Published.' });
    case 'unpublish':
      await updateProject(env.DB, id, { published: 0 });
      return flashRedirect('/admin/projects', { ok: 'Moved to draft.' });
    case 'feature':
      await updateProject(env.DB, id, { featured: 1 });
      return flashRedirect('/admin/projects', { ok: 'Featured.' });
    case 'unfeature':
      await updateProject(env.DB, id, { featured: 0 });
      return flashRedirect('/admin/projects', { ok: 'Unfeatured.' });
    case 'setcover': {
      const url = strField(form, 'url', 500);
      await updateProject(env.DB, id, { cover_image: url });
      return flashRedirect(`/admin/projects/${id}`, { ok: 'Cover updated.' });
    }
    case 'delete':
      await deleteProject(env.DB, id);
      return flashRedirect('/admin/projects', { ok: 'Project deleted.' });
    default:
      return flashRedirect('/admin/projects', { err: 'Unknown action.' });
  }
};
