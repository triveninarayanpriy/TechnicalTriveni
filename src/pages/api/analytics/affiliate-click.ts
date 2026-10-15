import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();
    // Non-blocking log for audit / analytics
    if (text) {
      try {
        const payload = JSON.parse(text);
        // Can be forwarded to analytics or stored in KV
      } catch {}
    }
  } catch {}

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
};
