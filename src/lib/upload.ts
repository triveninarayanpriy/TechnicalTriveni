/** Store an uploaded File into KV under a safe, unique key. */
export interface UploadResult {
  key: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface BlobMeta {
  contentType: string;
  filename: string;
  size: number;
}

// KV value limit is 25 MB. Keep a hair under it.
const MAX_BYTES = 25 * 1024 * 1024;

function sanitizeName(name: string): string {
  return (name || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 100);
}

export async function uploadToStore(
  kv: KVNamespace,
  file: File,
  prefix: string,
): Promise<UploadResult> {
  if (!file || typeof file === 'string' || file.size === 0) {
    throw new Error('No file provided.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File is too large (max 25 MB). Zip/compress it, or split large 3D files.');
  }
  const clean = sanitizeName(file.name);
  const key = `${prefix}/${crypto.randomUUID()}-${clean}`;
  const contentType = file.type || 'application/octet-stream';
  const buf = await file.arrayBuffer();
  await kv.put(key, buf, {
    metadata: { contentType, filename: clean, size: file.size } satisfies BlobMeta,
  });
  return { key, filename: clean, size: file.size, contentType };
}
