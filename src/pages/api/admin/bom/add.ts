import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addBom, getComponent } from '../../../../lib/db';
import { csrfOk, checkbox, intField, strField, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const projectId = intField(form, 'project_id', 0);
  if (!projectId) return adminResponse(request, '/admin/projects', { err: 'Missing project.' });
  const back = `/admin/projects/${projectId}`;

  // Optionally reference a reusable library component (its price/link stay live).
  const componentId = intField(form, 'component_id', 0);
  let name = strField(form, 'name', 160);
  let store = strField(form, 'store', 60);
  let affiliate_url = strField(form, 'affiliate_url', 500);
  let unit_price_inr = 0;
  let is_affiliate = checkbox(form, 'is_affiliate');
  let price_checked = '';

  let finalCompId = componentId;
  const formAffUrl = strField(form, 'affiliate_url', 500);

  if (componentId > 0) {
    const comp = await getComponent(env.DB, componentId);
    if (!comp) return adminResponse(request, back, { err: 'That component was not found.' });
    name = comp.name; store = comp.store;
    affiliate_url = formAffUrl || comp.buy_url;
    unit_price_inr = unit_price_inr || comp.unit_price_inr;
    is_affiliate = affiliate_url ? 1 : comp.is_affiliate;
    price_checked = comp.price_checked;

    if (formAffUrl && formAffUrl !== comp.buy_url) {
      await env.DB.prepare(`
        UPDATE components SET buy_url = ?, is_affiliate = 1, unit_price_inr = CASE WHEN ? > 0 THEN ? ELSE unit_price_inr END, updated_at = ? WHERE id = ?
      `).bind(formAffUrl, unit_price_inr, unit_price_inr, Math.floor(Date.now() / 1000), componentId).run();
    }
  } else if (!name) {
    return adminResponse(request, back, { err: 'Enter a component name or pick one from the library.' });
  } else {
    // New component - save it to the component library too so user never loses their affiliate link
    try {
      const now = Math.floor(Date.now() / 1000);
      const insertComp = await env.DB.prepare(`
        INSERT INTO components (name, store, buy_url, is_affiliate, unit_price_inr, price_checked, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        name,
        store || 'Robu / Amazon',
        affiliate_url,
        affiliate_url ? 1 : 0,
        unit_price_inr,
        new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        '',
        now,
        now
      ).run();
      finalCompId = (insertComp.meta.last_row_id as number) || 0;
    } catch {}
  }

  const id = await addBom(env.DB, {
    project_id: projectId,
    name,
    qty: strField(form, 'qty', 20) || '1',
    notes: strField(form, 'notes', 300),
    store,
    affiliate_url,
    unit_price_inr,
    price_checked,
    is_affiliate,
    component_id: finalCompId,
    sort: 0,
    is_required: checkbox(form, 'is_required'),
    group_name: strField(form, 'group_name', 60),
    stage_tag: strField(form, 'stage_tag', 60),
  });
  return adminResponse(request, back, { ok: 'Component added.', data: { id, projectId, name, qty: strField(form, 'qty', 20) || '1', unit_price_inr, store, affiliate_url } });
};

