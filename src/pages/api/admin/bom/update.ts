import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateBom } from '../../../../lib/db';
import { csrfOk, intField, strField, checkbox, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = `/admin/projects/${projectId}`;
  if (!id || !projectId) return flashRedirect(back, { err: 'Missing ID.' });

  try {
    await updateBom(env.DB, id, {
      name: strField(form, 'name', 100),
      qty: strField(form, 'qty', 20) || '1',
      unit_price_inr: intField(form, 'unit_price_inr', 0),
      store: strField(form, 'store', 50),
      price_checked: strField(form, 'price_checked', 20),
      affiliate_url: strField(form, 'affiliate_url', 500),
      notes: strField(form, 'notes', 200),
      is_affiliate: checkbox(form, 'is_affiliate'),
      component_id: intField(form, 'component_id', 0)
    });
    return flashRedirect(back, { ok: 'Part updated.' });
  } catch (e: any) {
    return flashRedirect(back, { err: e?.message || 'Update failed.' });
  }
};
