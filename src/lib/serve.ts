/** Stream a private R2 object to the browser as a download. */
export async function serveFromR2(bucket: R2Bucket, key: string, filename: string): Promise<Response> {
  if (!key) {
    return new Response('This file has not been uploaded yet. Please contact us.', { status: 404 });
  }
  const obj = await bucket.get(key);
  if (!obj) return new Response('File not found.', { status: 404 });

  const safe = (filename || 'download').replace(/["\\\r\n]/g, '');
  const headers = new Headers();
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
  headers.set(
    'Content-Disposition',
    `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(filename || 'download')}`,
  );
  if (obj.size) headers.set('Content-Length', String(obj.size));
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(obj.body, { headers });
}
