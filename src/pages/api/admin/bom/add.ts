import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addBom, getComponent } from '../../../../lib/db';
import { csrfOk, checkbox, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return flashRedirect('/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  // Optionally reference a reusable library component (its price/link stay live).
  const componentId = intField(form, 'component_id', 0);
  let name = strField(form, 'name', 160);
  let store = strField(form, 'store', 60);
  let affiliate_url = strField(form, 'affiliate_url', 500);
  let unit_price_inr = intField(form, 'unit_price_inr', 0);
  let is_affiliate = checkbox(form, 'is_affiliate');
  let price_checked = strField(form, 'price_checked', 40);

  if (componentId > 0) {
    const comp = await getComponent(env.DB, componentId);
    if (!comp) return flashRedirect(back, { err: 'That component was not found.' });
    // Snapshot fields for display; live values are re-resolved on the public page.
    name = comp.name; store = comp.store; affiliate_url = comp.buy_url;
    unit_price_inr = comp.unit_price_inr; is_affiliate = comp.is_affiliate; price_checked = comp.price_checked;
  } else if (!name) {
    return flashRedirect(back, { err: 'Enter a component name or pick one from the library.' });
  }

  await addBom(env.DB, {
    project_id: projectId,
    name,
    qty: strField(form, 'qty', 20) || '1',
    notes: strField(form, 'notes', 300),
    store,
    affiliate_url,
    unit_price_inr,
    price_checked,
    is_affiliate,
    component_id: componentId,
    sort: 0,
    is_required: checkbox(form, 'is_required'),
    group_name: strField(form, 'group_name', 60),
    stage_tag: strField(form, 'stage_tag', 60),
  });
  return flashRedirect(back, { ok: 'Component added.' });
};

