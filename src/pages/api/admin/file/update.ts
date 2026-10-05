import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateFile } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = `/admin/projects/${projectId}`;
  if (!id || !projectId) return flashRedirect(back, { err: 'Missing ID.' });

  const access = form.get('access_level');
  const is_free = access === 'free' ? 1 : 0;
  const in_combo = access === 'combo' ? 1 : 0;

  try {
    await updateFile(env.DB, id, {
      label: strField(form, 'label', 150),
      kind: strField(form, 'kind', 20),
      is_free,
      in_combo
    });
    return flashRedirect(back, { ok: 'File updated.' });
  } catch (e: any) {
    return flashRedirect(back, { err: e?.message || 'Update failed.' });
  }
};
