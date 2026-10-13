import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getGeminiApiKey, generateTabSuggestions } from '../../../../lib/gemini';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED', message: 'Admin authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let tab = '';
  let context: any = {};
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      tab = String(body.tab || '').trim();
      context = body.context || {};
    } else {
      const form = await request.formData();
      tab = String(form.get('tab') || '').trim();
      context = {
        title: form.get('title'),
        summary: form.get('summary'),
        description: form.get('description'),
        category: form.get('category')
      };
    }
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST', message: 'Invalid payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!tab) {
    return new Response(JSON.stringify({ ok: false, error: 'MISSING_TAB', message: 'Target tab is required.' }), {
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

  try {
    const suggestions = await generateTabSuggestions(apiKey, tab, context);
    return new Response(JSON.stringify({ ok: true, suggestions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'API_ERROR',
      message: err?.message || 'Failed to generate suggestions with Gemini.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
