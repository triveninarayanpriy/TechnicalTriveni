import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addImage, syncProjectMedia } from '../../../../lib/db';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

const MODEL_EXT = /\.(glb|gltf)$/i;
const kindOf = (name: string) => (MODEL_EXT.test(name) ? 'model' : 'image');

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  // AJAX uploads set this so we can answer with JSON (progress UI, no full-page redirect).
  const wantsJson = request.headers.get('x-requested-with') === 'fetch';
  const reply = (status: number, body: { ok?: string; err?: string }, to: string) =>
    wantsJson
      ? new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
      : flashRedirect(to, body);

  if (!csrfOk(cookies, form)) return reply(403, { err: 'Session expired.' }, '/admin/projects');

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return reply(400, { err: 'Missing project.' }, '/admin/projects');
  const back = `/admin/projects/${projectId}`;
  const caption = strField(form, 'caption', 200);

  // Multiple files (photos and/or .glb/.gltf models) in one upload.
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  const externalUrl = strField(form, 'url', 500);

  let added = 0;
  try {
    for (const file of files) {
      const kind = kindOf(file.name);
      const up = await uploadToStore(env.BLOBS, file, `projects/${projectId}/${kind === 'model' ? 'models' : 'images'}`);
      await addImage(env.DB, projectId, `/media/${up.key}`, added === 0 ? caption : '', kind);
      added++;
    }
    if (externalUrl) {
      await addImage(env.DB, projectId, externalUrl, caption, kindOf(externalUrl));
      added++;
    }
    if (added === 0) return reply(400, { err: 'Choose one or more photos / .glb files (or paste a URL).' }, back);

    await syncProjectMedia(env.DB, projectId);
    return reply(200, { ok: `Added ${added} item${added > 1 ? 's' : ''}.` }, back);
  } catch (e: any) {
    if (added > 0) await syncProjectMedia(env.DB, projectId);
    return reply(500, { err: e?.message || 'Upload failed.' }, back);
  }
};
