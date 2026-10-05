import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim();
  const referer = request.headers.get('Referer') || '/';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return new Response(null, { status: 303, headers: { Location: `${referer}?sub=err` } });
  }

  try {
    await env.DB.prepare('INSERT INTO subscribers (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET unsubscribed = 0')
      .bind(email, Math.floor(Date.now() / 1000))
      .run();
    return new Response(null, { status: 303, headers: { Location: `${referer}?sub=ok` } });
  } catch (err) {
    return new Response(null, { status: 303, headers: { Location: `${referer}?sub=err` } });
  }
};
