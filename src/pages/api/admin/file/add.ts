import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addFile } from '../../../../lib/db';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk, checkbox, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return flashRedirect('/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const label = strField(form, 'label', 140);
  const kind = strField(form, 'kind', 20) || 'other';
  const file = form.get('file');

  if (!label) return flashRedirect(back, { err: 'A label is required.' });
  if (!(file instanceof File) || file.size === 0) return flashRedirect(back, { err: 'Choose a file to upload.' });

  try {
    const up = await uploadToStore(env.BLOBS, file, `projects/${projectId}/files`);
    await addFile(env.DB, {
      project_id: projectId,
      label,
      kind,
      r2_key: up.key,
      filename: up.filename,
      size_bytes: up.size,
      is_free: checkbox(form, 'is_free'),
      in_combo: checkbox(form, 'in_combo'),
      sort: 0,
    });
    return flashRedirect(back, { ok: 'File uploaded.' });
  } catch (e: any) {
    return flashRedirect(back, { err: e?.message || 'Upload failed.' });
  }
};
