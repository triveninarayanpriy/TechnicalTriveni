import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import type { BlobMeta } from '../../lib/upload';

/** Serve public project images stored in KV. */
export const GET: APIRoute = async ({ params }) => {
  const key = params.key;
  if (!key) return new Response('Not found', { status: 404 });

  const { value, metadata } = await env.BLOBS.getWithMetadata<BlobMeta>(key, { type: 'arrayBuffer' });
  if (!value) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', metadata?.contentType || 'application/octet-stream');
  headers.set('Content-Length', String((value as ArrayBuffer).byteLength));
  // Keys contain a uuid → content is immutable, cache hard.
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(value, { headers });
};
