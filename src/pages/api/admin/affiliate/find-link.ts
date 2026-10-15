import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getGeminiApiKey, getGeminiModel } from '../../../../lib/gemini';
import { getComponent, getComponentLink, upsertComponentLink } from '../../../../lib/db';
import { findAmazonBuyLinkWithGemini } from '../../../../lib/gemini-buylink';
import { csrfOk } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    const form = await request.formData();
    if (!csrfOk(cookies, form)) {
      return new Response(JSON.stringify({ ok: false, error: 'Session expired' }), { status: 403 });
    }
    body = {
      component_id: parseInt(String(form.get('component_id') || '0'), 10),
      force: form.get('force') === '1'
    };
  }

  const componentId = Number(body.component_id);
  if (!componentId) {
    return new Response(JSON.stringify({ ok: false, error: 'component_id is required' }), { status: 400 });
  }

  const comp = await getComponent(env.DB, componentId);
  if (!comp) {
    return new Response(JSON.stringify({ ok: false, error: 'Component not found' }), { status: 404 });
  }

  // Check 7-day cache
  const existingLink = await getComponentLink(env.DB, componentId);
  const now = Date.now();
  if (!body.force && existingLink && existingLink.updated_at) {
    const linkTime = new Date(existingLink.updated_at).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (now - linkTime < sevenDaysMs && existingLink.asin) {
      return new Response(JSON.stringify({
        ok: true,
        cached: true,
        link: existingLink
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const apiKey = await getGeminiApiKey(env, env.DB);
  if (!apiKey) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Gemini API key is not configured. Please add it in Settings > Integrations.'
    }), { status: 400 });
  }

  const modelName = await getGeminiModel(env, env.DB);

  try {
    const result = await findAmazonBuyLinkWithGemini(apiKey, modelName, {
      id: comp.id,
      name: comp.name,
      notes: comp.notes
    });

    const bestCandidate = result.candidates[result.best_index] || null;

    if (bestCandidate && bestCandidate.asin) {
      const status = 'unverified'; // Stays unverified until human review confirms it
      await upsertComponentLink(env.DB, {
        component_id: comp.id,
        store: 'amazon',
        asin: bestCandidate.asin,
        canonical_url: bestCandidate.url,
        title: bestCandidate.title,
        status,
        confidence: bestCandidate.confidence,
        source: 'gemini',
        grounded: bestCandidate.grounded ? 1 : 0,
        evidence: JSON.stringify({
          query_used: result.query_used,
          why_match: bestCandidate.why_match,
          spec_matches: bestCandidate.spec_matches,
          spec_mismatches: bestCandidate.spec_mismatches,
          needs_review_reason: result.needs_review_reason,
          grounding_urls: result.grounding_urls,
          tokens_used: result.tokens_used
        })
      });
    } else {
      // Nothing qualified on Amazon India -> fallback to search_only
      await upsertComponentLink(env.DB, {
        component_id: comp.id,
        store: 'amazon',
        asin: '',
        canonical_url: '',
        title: comp.name,
        status: 'search_only',
        confidence: 0,
        source: 'gemini',
        grounded: 0,
        evidence: JSON.stringify({
          query_used: result.query_used,
          needs_review_reason: result.needs_review_reason || 'No qualifying Amazon India product found.',
          grounding_urls: result.grounding_urls,
          tokens_used: result.tokens_used
        })
      });
    }

    const updated = await getComponentLink(env.DB, comp.id);

    return new Response(JSON.stringify({
      ok: true,
      result,
      link: updated
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: err.message || 'Failed to search Amazon link with Gemini'
    }), { status: 500 });
  }
};
