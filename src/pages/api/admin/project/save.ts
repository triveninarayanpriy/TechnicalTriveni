import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createProject, updateProject, slugExists } from '../../../../lib/db';
import { csrfOk, checkbox, intField, strField, flashRedirect } from '../../../../lib/admin';
import { slugify } from '../../../../lib/format';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired, try again.' });

  const id = intField(form, 'id', 0);
  const title = strField(form, 'title', 140);
  if (!title) return flashRedirect(id ? `/admin/projects/${id}` : '/admin/projects/new', { err: 'Title is required.' });

  // Slug: use provided or derive from title; ensure uniqueness.
  let base = slugify(strField(form, 'slug', 80) || title);
  if (!base) base = `project-${Date.now()}`;
  let slug = base;
  let n = 2;
  while (await slugExists(env.DB, slug, id)) slug = `${base}-${n++}`;

  const data = {
    slug,
    title,
    summary: strField(form, 'summary', 240),
    description: strField(form, 'description', 20000),
    category: strField(form, 'category', 60) || 'Electronics',
    difficulty: strField(form, 'difficulty', 20) || 'Beginner',
    cover_image: strField(form, 'cover_image', 500),
    video_url: strField(form, 'video_url', 500),
    tags: strField(form, 'tags', 300),
    build_time: strField(form, 'build_time', 60),
    price_inr: Math.max(0, intField(form, 'price_inr', 0)),
    combo_enabled: checkbox(form, 'combo_enabled'),
    combo_title: strField(form, 'combo_title', 120) || 'Complete Project Combo',
    combo_description: strField(form, 'combo_description', 2000),
    featured: checkbox(form, 'featured'),
    published: checkbox(form, 'published'),
    sort: intField(form, 'sort', 0),
  };

  if (id > 0) {
    await updateProject(env.DB, id, data);
    return flashRedirect(`/admin/projects/${id}`, { ok: 'Project saved.' });
  }
  const newId = await createProject(env.DB, data);
  return flashRedirect(`/admin/projects/${newId}`, { ok: 'Project created — now add images, files & parts.' });
};
