import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { markComponentLinkStatus, upsertComponentLink, getComponentLink } from '../../../../lib/db';
import { csrfOk } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  let componentId = 0;
  let status = '';
  try {
    const json = await request.json();
    componentId = Number(json.component_id);
    status = String(json.status || '');
  } catch {
    const form = await request.formData();
    if (!csrfOk(cookies, form)) {
      return new Response(JSON.stringify({ ok: false, error: 'Session expired' }), { status: 403 });
    }
    componentId = parseInt(String(form.get('component_id') || '0'), 10);
    status = String(form.get('status') || '');
  }

  const validStatuses = ['unverified', 'verified', 'search_only', 'stale', 'broken'];
  if (!componentId || !validStatuses.includes(status)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid component_id or status.' }), { status: 400 });
  }

  const existing = await getComponentLink(env.DB, componentId);
  if (!existing) {
    await upsertComponentLink(env.DB, {
      component_id: componentId,
      status: status as any,
      source: 'manual'
    });
  } else {
    await markComponentLinkStatus(env.DB, componentId, status, locals.admin.email || 'admin');
  }

  return new Response(JSON.stringify({
    ok: true,
    message: `Status updated to ${status}.`,
    component_id: componentId,
    status
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
