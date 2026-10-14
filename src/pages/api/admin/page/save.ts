import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { upsertPage, recordPageRevision } from '../../../../lib/db';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { slugify } from '../../../../lib/format';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isJson = request.headers.get('accept')?.includes('application/json') ||
                 request.headers.get('content-type')?.includes('application/json');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Invalid form data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Invalid form submission.' });
  }

  if (!csrfOk(cookies, form)) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Session expired, please refresh.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Session expired, try again.' });
  }

  const slugRaw = strField(form, 'slug', 80);
  const title = strField(form, 'title', 140);

  if (!slugRaw || !title) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Slug and title are required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Slug and title are required.' });
  }

  const slug = slugify(slugRaw);
  let imageUrl = strField(form, 'image_url', 1000);

  const imageFile = form.get('image');
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    try {
      const up = await uploadToStore(env.BLOBS, imageFile, `pages/${slug}`);
      imageUrl = `/media/${up.key}`;
    } catch (e: any) {
      if (isJson) return new Response(JSON.stringify({ ok: false, error: `Image upload failed: ${e.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      return flashRedirect(`/admin/pages/${slug}`, { err: `Image upload failed: ${e.message}` });
    }
  }

  const published = form.get('published') === '1' || form.get('published') === 'true' ? 1 : 0;
  const meta_title = strField(form, 'meta_title', 200) || '';
  const meta_description = strField(form, 'meta_description', 500) || '';
  const rawContent = strField(form, 'content_md', 60000) || '';
  const hasContent = rawContent.trim().length > 0;

  // An empty content field saves as "use default" with a warning rather than blocking with required error
  const is_custom = hasContent ? 1 : 0;

  const data = {
    slug,
    title,
    content_md: rawContent,
    image_url: imageUrl,
    published,
    meta_title,
    meta_description,
    is_custom,
  };

  try {
    await upsertPage(env.DB, data);

    if (hasContent) {
      await recordPageRevision(env.DB, {
        page_slug: slug,
        title,
        content_md: rawContent,
        meta_title,
        meta_description,
        source: 'custom',
        note: 'Custom content saved',
      });
    }

    const message = hasContent
      ? 'Page saved successfully.'
      : 'Empty content saved. Page is now using the built-in site default.';

    if (isJson) {
      return new Response(JSON.stringify({
        ok: true,
        msg: message,
        slug,
        is_custom,
        published,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return flashRedirect(`/admin/pages/${slug}`, { ok: message });
  } catch (err: any) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect(`/admin/pages/${slug}`, { err: err.message });
  }
};
