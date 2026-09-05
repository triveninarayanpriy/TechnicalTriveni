import type { BlobMeta } from './upload';

/** Stream a stored blob (from KV) to the browser as a download. */
export async function serveFromStore(kv: KVNamespace, key: string, filename: string): Promise<Response> {
  if (!key) {
    return new Response('This file has not been uploaded yet. Please contact us.', { status: 404 });
  }
  const { value, metadata } = await kv.getWithMetadata<BlobMeta>(key, { type: 'arrayBuffer' });
  if (!value) return new Response('File not found.', { status: 404 });

  const name = filename || metadata?.filename || 'download';
  const safe = name.replace(/["\\\r\n]/g, '');
  const headers = new Headers();
  headers.set('Content-Type', metadata?.contentType || 'application/octet-stream');
  headers.set(
    'Content-Disposition',
    `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(name)}`,
  );
  headers.set('Content-Length', String((value as ArrayBuffer).byteLength));
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(value, { headers });
}
