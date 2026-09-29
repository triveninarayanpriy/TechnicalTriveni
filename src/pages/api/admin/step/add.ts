import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addStep } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });
  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return flashRedirect('/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const body = strField(form, 'body', 4000);
  if (!body) return flashRedirect(back, { err: 'Step instruction is required.' });

  await addStep(env.DB, {
    project_id: projectId,
    title: strField(form, 'title', 160),
    body,
    why: strField(form, 'why', 600),
    image_url: strField(form, "image_url", 500),
    goal: strField(form, "goal", 200),
    time_est: strField(form, "time_est", 100),
    parts_needed: form.getAll("parts_needed").filter(Boolean).join(","),
    file_id: intField(form, "file_id", 0) || null,
    expected_res: strField(form, "expected_res", 500),
    if_fails: strField(form, "if_fails", 500),
    video_ts: strField(form, "video_ts", 20),
  });
  return flashRedirect(back, { ok: 'Step added.' });
};
