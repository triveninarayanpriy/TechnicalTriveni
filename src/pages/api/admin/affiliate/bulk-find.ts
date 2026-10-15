import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getGeminiApiKey, getGeminiModel } from '../../../../lib/gemini';
import { listComponentsWithLinks, upsertComponentLink } from '../../../../lib/db';
import { findAmazonBuyLinkWithGemini, mapConcurrent } from '../../../../lib/gemini-buylink';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  const apiKey = await getGeminiApiKey(env, env.DB);
  if (!apiKey) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Gemini API key is not configured. Please add it in Settings > Integrations.'
    }), { status: 400 });
  }

  const modelName = await getGeminiModel(env, env.DB);

  // Get all components without a verified link
  const components = await listComponentsWithLinks(env.DB);
  const targets = components.filter(c => !c.link || c.link.status !== 'verified');

  if (targets.length === 0) {
    return new Response(JSON.stringify({
      ok: true,
      message: 'All components already have verified links!',
      processed: 0
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Concurrency limit 3
  const results = await mapConcurrent(targets, 3, async (comp) => {
    try {
      const res = await findAmazonBuyLinkWithGemini(apiKey, modelName, {
        id: comp.id,
        name: comp.name,
        notes: comp.notes
      });

      const best = res.candidates[res.best_index] || null;
      if (best && best.asin) {
        await upsertComponentLink(env.DB, {
          component_id: comp.id,
          store: 'amazon',
          asin: best.asin,
          canonical_url: best.url,
          title: best.title,
          status: 'unverified',
          confidence: best.confidence,
          source: 'gemini',
          grounded: best.grounded ? 1 : 0,
          evidence: JSON.stringify({
            query_used: res.query_used,
            why_match: best.why_match,
            spec_matches: best.spec_matches,
            spec_mismatches: best.spec_mismatches,
            needs_review_reason: res.needs_review_reason,
            grounding_urls: res.grounding_urls,
            tokens_used: res.tokens_used
          })
        });
        return { component_id: comp.id, name: comp.name, status: 'unverified', asin: best.asin, title: best.title };
      } else {
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
            query_used: res.query_used,
            needs_review_reason: res.needs_review_reason || 'No qualifying Amazon India product found.',
            grounding_urls: res.grounding_urls,
            tokens_used: res.tokens_used
          })
        });
        return { component_id: comp.id, name: comp.name, status: 'search_only' };
      }
    } catch (err: any) {
      return { component_id: comp.id, name: comp.name, status: 'error', error: err.message };
    }
  });

  return new Response(JSON.stringify({
    ok: true,
    processed: results.length,
    results
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
