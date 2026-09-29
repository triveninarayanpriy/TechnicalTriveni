import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateComponent } from '../../../../lib/db';
import { csrfOk, checkbox, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/components', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const name = strField(form, 'name', 160);
  if (!id || !name) return flashRedirect('/admin/components', { err: 'Missing component data.' });

  await updateComponent(env.DB, id, {
    name,
    store: strField(form, 'store', 60),
    buy_url: strField(form, 'buy_url', 500),
    is_affiliate: checkbox(form, 'is_affiliate'),
    unit_price_inr: intField(form, 'unit_price_inr', 0),
    price_checked: strField(form, 'price_checked', 40),
    notes: strField(form, 'notes', 300),
  });
  return flashRedirect('/admin/components', { ok: 'Component updated — new price is live on every project using it.' });
};
