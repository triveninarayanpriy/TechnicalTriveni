import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createProject, updateProject, slugExists, getProjectById } from '../../../../lib/db';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk, checkbox, intField, strField, flashRedirect } from '../../../../lib/admin';
import { slugify } from '../../../../lib/format';

// Builds that involve mains, batteries or motors must carry a safety note.
const RISK_RE = /\b(mains|230\s?v|220\s?v|110\s?v|high[-\s]?voltage|lipo|li[-\s]?ion|lithium|batter(?:y|ies)|motor|servo|relay|solder(?:ing)?)\b/i;

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

  const archFile = form.get('arch_file') as File | null;
  let arch_image_url = strField(form, 'arch_image_url', 500);
  if (archFile && archFile.size > 0 && id > 0) {
    const up = await uploadToStore(env.BLOBS, archFile, 'projects/' + id + '/images');
    arch_image_url = '/media/' + up.key;
  }

  const data = {
    slug,
    title,
    summary: strField(form, 'summary', 500),
    description: strField(form, 'description', 20000),
    category: strField(form, 'category', 60) || 'Electronics',
    difficulty: strField(form, 'difficulty', 20) || 'Beginner',
    // cover_image + model_url are derived from the ordered gallery (syncProjectMedia).
    video_url: strField(form, 'video_url', 500),
    is_new: checkbox(form, 'is_new'),
    tags: strField(form, 'tags', 300),
    build_time: strField(form, 'build_time', 60),
    outcome_line: strField(form, 'outcome_line', 240),
    cost_override: intField(form, 'cost_override', 0),
    cost_checked: strField(form, 'cost_checked', 40),
    safety_note: strField(form, 'safety_note', 5000),
    license: strField(form, 'license', 60) || 'MIT',
    credits: strField(form, 'credits', 2000),
    code_repo_url: strField(form, 'code_repo_url', 300),
    price_inr: Math.max(0, intField(form, 'price_inr', 0)),
    combo_enabled: checkbox(form, 'combo_enabled'),
    combo_title: strField(form, 'combo_title', 120) || 'Complete Project Combo',
    combo_description: strField(form, 'combo_description', 2000),
    featured: checkbox(form, 'featured'),
    published: checkbox(form, 'published'),
    
    sort: intField(form, 'sort', 0),
    meta_title: strField(form, 'meta_title', 140),
    meta_description: strField(form, 'meta_description', 500),
    og_image: strField(form, 'og_image', 500),
    arch_svg: strField(form, 'arch_svg', 100000),
    arch_image_url,
    arch_alt: strField(form, 'arch_alt', 300),
  };


  // --- Publish gates: keep live projects complete & safe. On failure we still
  //     SAVE the content, but force it back to draft and explain what's missing.
  if (data.published === 1) {
    const missing: string[] = [];
    if (!data.summary) missing.push('a summary');
    const riskText = `${data.title} ${data.summary} ${data.tags} ${data.category} ${data.description}`;
    if (RISK_RE.test(riskText) && !data.safety_note) missing.push('a safety note (this looks like a mains/battery/motor build)');
    if (missing.length) {
      data.published = 0; // save as draft, don't publish incomplete
      const where = id > 0 ? `/admin/projects/${id}` : '/admin/projects/new';
      const savedId = id > 0 ? id : await createProject(env.DB, data);
      if (id > 0) await updateProject(env.DB, id, data);
      return flashRedirect(id > 0 ? where : `/admin/projects/${savedId}`, {
        err: `Saved as draft — add ${missing.join(', ')} before publishing.`,
      });
    }
  }

  if (id > 0) {
    await updateProject(env.DB, id, data);
    return flashRedirect(`/admin/projects/${id}`, { ok: 'Project saved.' });
  }
  const newId = await createProject(env.DB, data);
  return flashRedirect(`/admin/projects/${newId}`, { ok: 'Project created — now add images, files & parts.' });
};





