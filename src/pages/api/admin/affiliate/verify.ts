import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyComponentLink, getComponentLink } from '../../../../lib/db';
import { csrfOk } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  let componentId = 0;
  try {
    const json = await request.json();
    componentId = Number(json.component_id);
  } catch {
    const form = await request.formData();
    if (!csrfOk(cookies, form)) {
      return new Response(JSON.stringify({ ok: false, error: 'Session expired' }), { status: 403 });
    }
    componentId = parseInt(String(form.get('component_id') || '0'), 10);
  }

  if (!componentId) {
    return new Response(JSON.stringify({ ok: false, error: 'component_id required' }), { status: 400 });
  }

  const link = await getComponentLink(env.DB, componentId);
  if (!link || !link.asin) {
    return new Response(JSON.stringify({ ok: false, error: 'Cannot verify a link without a valid ASIN.' }), { status: 400 });
  }

  const verifier = locals.admin.email || 'admin';
  await verifyComponentLink(env.DB, componentId, verifier);

  return new Response(JSON.stringify({
    ok: true,
    message: 'Link verified successfully.',
    component_id: componentId
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
