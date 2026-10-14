import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getGeminiApiKey, getGeminiModel, generateComprehensiveDraft, checkAiRateLimit } from '../../../../lib/gemini';
import { listComponents } from '../../../../lib/db';
import { matchBomList } from '../../../../lib/component-matcher';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED', message: 'Admin authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rate limiting per admin user
  const rateLimitKey = locals.admin.email || 'admin';
  const rateCheck = checkAiRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many AI requests. Please wait ${rateCheck.retryAfterSec} seconds before drafting again.`
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST', message: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const notes = String(body.notes || '').trim();
  const code_snippet = String(body.code_snippet || '').trim();
  const bom_pasted = String(body.bom_pasted || '').trim();
  const wiring_notes = String(body.wiring_notes || '').trim();
  const project_context = body.project_context || {};

  if (!notes && !code_snippet && !bom_pasted && !wiring_notes) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'EMPTY_INPUT',
      message: 'Please provide rough notes, code files, BOM list, or wiring notes to generate a draft.'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = await getGeminiApiKey(env, env.DB);
  if (!apiKey) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'NO_KEY',
      message: 'Gemini API key is not configured. Please add your key in Settings > Integrations.'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const modelName = await getGeminiModel(env, env.DB);

  try {
    const draft = await generateComprehensiveDraft(apiKey, modelName, {
      notes,
      code_snippet,
      bom_pasted,
      wiring_notes,
      project_context
    });

    // Match BOM proposals against the component library
    const library = await listComponents(env.DB);
    const matched_bom = matchBomList(draft.bom, library);

    return new Response(JSON.stringify({
      ok: true,
      draft,
      matched_bom,
      model_used: modelName,
      library_count: library.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'API_ERROR',
      message: err?.message || 'Failed to generate comprehensive draft with Gemini.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
