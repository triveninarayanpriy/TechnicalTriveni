import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateBom } from '../../../../lib/db';
import { csrfOk, intField, strField, checkbox, adminResponse } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return adminResponse(request, '/admin/projects', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const projectId = intField(form, 'project_id', 0);
  const back = `/admin/projects/${projectId}`;
  if (!id || !projectId) return adminResponse(request, back, { err: 'Missing ID.' });

  try {
    const compId = intField(form, 'component_id', 0);
    const affUrl = strField(form, 'affiliate_url', 500);
    const unitPrice = intField(form, 'unit_price_inr', 0);

    await updateBom(env.DB, id, {
      name: strField(form, 'name', 100),
      qty: strField(form, 'qty', 20) || '1',
      unit_price_inr: unitPrice,
      store: strField(form, 'store', 50),
      price_checked: strField(form, 'price_checked', 20),
      affiliate_url: affUrl,
      notes: strField(form, 'notes', 200),
      is_affiliate: checkbox(form, 'is_affiliate'),
      component_id: compId
    });

    // Also sync affiliate link & price to the library component so all projects share the updated affiliate link
    if (compId > 0 && affUrl) {
      await env.DB.prepare(`
        UPDATE components
        SET buy_url = ?, is_affiliate = 1,
            unit_price_inr = CASE WHEN ? > 0 THEN ? ELSE unit_price_inr END,
            updated_at = ?
        WHERE id = ?
      `).bind(affUrl, unitPrice, unitPrice, Math.floor(Date.now() / 1000), compId).run();
    }

    return adminResponse(request, back, { ok: 'Part updated and synced to library.', data: { id, projectId } });
  } catch (e: any) {
    return adminResponse(request, back, { err: e?.message || 'Update failed.' });
  }
};
