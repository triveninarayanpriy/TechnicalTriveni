import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateStep } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = `/admin/projects/${projectId}`;
  if (!id || !projectId) return flashRedirect(back, { err: 'Missing ID.' });

  try {
    await updateStep(env.DB, id, {
      title: strField(form, 'title', 200),
      body: strField(form, 'body', 5000),
      why: strField(form, 'why', 500)
    });
    return flashRedirect(back, { ok: 'Step updated.' });
  } catch (e: any) {
    return flashRedirect(back, { err: e?.message || 'Update failed.' });
  }
};
