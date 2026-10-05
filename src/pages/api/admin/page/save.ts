import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { upsertPage } from '../../../../lib/db';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { slugify } from '../../../../lib/format';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/pages', { err: 'Session expired, try again.' });

  const slugRaw = strField(form, 'slug', 80);
  const title = strField(form, 'title', 140);
  
  if (!slugRaw || !title) return flashRedirect('/admin/pages', { err: 'Slug and title are required.' });
  
  const slug = slugify(slugRaw);
  let imageUrl = strField(form, 'image_url', 1000);

  const imageFile = form.get('image');
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    try {
      const up = await uploadToStore(env.BLOBS, imageFile, `pages/${slug}`);
      imageUrl = `/media/${up.key}`;
    } catch (e: any) {
      return flashRedirect(`/admin/pages/${slug}`, { err: `Image upload failed: ${e.message}` });
    }
  }

  const published = form.get('published') === '1' ? 1 : 0;
  const meta_title = strField(form, 'meta_title', 200) || '';
  const meta_description = strField(form, 'meta_description', 500) || '';

  const data = {
    slug,
    title,
    content_md: strField(form, 'content_md', 60000),
    image_url: imageUrl,
    published,
    meta_title,
    meta_description,
  };

  try {
    await upsertPage(env.DB, data);
    return flashRedirect(`/admin/pages/${slug}`, { ok: 'Page saved.' });
  } catch (err: any) {
    return flashRedirect(`/admin/pages/${slug}`, { err: err.message });
  }
};
