import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getGeminiApiKey, generateDraftFromNotes } from '../../../../lib/gemini';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED', message: 'Admin authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let notes = '';
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      notes = String(body.notes || '').trim();
    } else {
      const form = await request.formData();
      notes = String(form.get('notes') || '').trim();
    }
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST', message: 'Invalid payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!notes) {
    return new Response(JSON.stringify({ ok: false, error: 'EMPTY_NOTES', message: 'Please paste notes, code, or a transcript first.' }), {
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
    const draft = await generateDraftFromNotes(apiKey, notes);
    return new Response(JSON.stringify({ ok: true, draft }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'API_ERROR',
      message: err?.message || 'Failed to generate draft with Gemini.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
