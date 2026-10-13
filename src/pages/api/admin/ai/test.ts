import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getGeminiApiKey, callGemini } from '../../../../lib/gemini';

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, message: 'Unauthorized' }), { status: 401 });
  }

  const apiKey = await getGeminiApiKey(env, env.DB);
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, message: 'No Gemini API key configured.' }), { status: 400 });
  }

  try {
    const res = await callGemini(apiKey, 'Respond with {"status": "ok"}', 'You are a test probe.');
    return new Response(JSON.stringify({ ok: true, message: 'Connected to Gemini successfully!', data: res }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err?.message || 'Connection test failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
