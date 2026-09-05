import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addBom } from '../../../../lib/db';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return flashRedirect('/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  const name = strField(form, 'name', 160);
  if (!name) return flashRedirect(back, { err: 'Component name is required.' });

  await addBom(env.DB, {
    project_id: projectId,
    name,
    qty: strField(form, 'qty', 20) || '1',
    notes: strField(form, 'notes', 300),
    store: strField(form, 'store', 60),
    affiliate_url: strField(form, 'affiliate_url', 500),
    unit_price_inr: intField(form, 'unit_price_inr', 0),
    sort: 0,
  });
  return flashRedirect(back, { ok: 'Component added.' });
};
