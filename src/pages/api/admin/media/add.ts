import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addImage } from '../../../../lib/db';
import { uploadToBucket } from '../../../../lib/upload';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return flashRedirect('/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;
  const caption = strField(form, 'caption', 200);

  const file = form.get('file');
  const externalUrl = strField(form, 'url', 500);

  try {
    let url = externalUrl;
    if (file instanceof File && file.size > 0) {
      const up = await uploadToBucket(env.MEDIA, file, `projects/${projectId}/images`);
      url = `/media/${up.key}`;
    }
    if (!url) return flashRedirect(back, { err: 'Provide an image file or URL.' });
    await addImage(env.DB, projectId, url, caption);
    return flashRedirect(back, { ok: 'Image added.' });
  } catch (e: any) {
    return flashRedirect(back, { err: e?.message || 'Upload failed.' });
  }
};
