import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

/** Serve public project images from the MEDIA R2 bucket. */
export const GET: APIRoute = async ({ params }) => {
  const key = params.key;
  if (!key) return new Response('Not found', { status: 404 });

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
  if (obj.size) headers.set('Content-Length', String(obj.size));
  // Images are content-addressed by a uuid in the key → safe to cache hard.
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  if (obj.httpEtag) headers.set('ETag', obj.httpEtag);
  return new Response(obj.body, { headers });
};
