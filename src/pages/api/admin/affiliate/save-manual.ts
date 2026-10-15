import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { buildAmazonLink } from '../../../../lib/affiliate';
import { getAffiliateSettings, upsertComponentLink, getComponent } from '../../../../lib/db';
import { csrfOk } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  let componentId = 0;
  let asinOrUrl = '';
  let markVerified = false;
  let customTitle = '';

  try {
    const json = await request.json();
    componentId = Number(json.component_id);
    asinOrUrl = String(json.asin_or_url || '').trim();
    markVerified = !!json.verified;
    customTitle = String(json.title || '').trim();
  } catch {
    const form = await request.formData();
    if (!csrfOk(cookies, form)) {
      return new Response(JSON.stringify({ ok: false, error: 'Session expired' }), { status: 403 });
    }
    componentId = parseInt(String(form.get('component_id') || '0'), 10);
    asinOrUrl = String(form.get('asin_or_url') || '').trim();
    markVerified = form.get('verified') === '1';
    customTitle = String(form.get('title') || '').trim();
  }

  if (!componentId || !asinOrUrl) {
    return new Response(JSON.stringify({ ok: false, error: 'component_id and asin_or_url are required.' }), { status: 400 });
  }

  const comp = await getComponent(env.DB, componentId);
  if (!comp) {
    return new Response(JSON.stringify({ ok: false, error: 'Component not found' }), { status: 404 });
  }

  const settings = await getAffiliateSettings(env.DB);

  let cleaned: ReturnType<typeof buildAmazonLink>;
  try {
    cleaned = buildAmazonLink(asinOrUrl, settings.amazon_tag);
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || 'Invalid Amazon URL or ASIN.' }), { status: 400 });
  }

  const nowIso = new Date().toISOString();
  await upsertComponentLink(env.DB, {
    component_id: componentId,
    store: 'amazon',
    asin: cleaned.asin,
    canonical_url: cleaned.canonicalUrl,
    title: customTitle || comp.name,
    status: markVerified ? 'verified' : 'unverified',
    confidence: 1.0,
    source: 'manual',
    grounded: 1,
    verified_at: markVerified ? nowIso : '',
    verified_by: markVerified ? (locals.admin.email || 'admin') : '',
    evidence: JSON.stringify({
      manually_entered_url: asinOrUrl,
      saved_at: nowIso
    })
  });

  return new Response(JSON.stringify({
    ok: true,
    message: markVerified ? 'Clean Amazon link saved and verified.' : 'Clean Amazon link saved.',
    asin: cleaned.asin,
    canonicalUrl: cleaned.canonicalUrl,
    affiliateUrl: cleaned.url
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
