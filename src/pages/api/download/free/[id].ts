import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getFileById } from '../../../../lib/db';
import { serveFromStore } from '../../../../lib/serve';

/** Download a file explicitly marked as free. */
export const GET: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!id) return new Response('Not found', { status: 404 });

  const file = await getFileById(env.DB, id);
  if (!file || file.is_free !== 1) return new Response('Not available', { status: 404 });

  return serveFromStore(env.BLOBS, file.r2_key, file.filename || file.label);
};
