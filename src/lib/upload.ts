/** Store an uploaded File into an R2 bucket under a safe, unique key. */
export interface UploadResult {
  key: string;
  filename: string;
  size: number;
  contentType: string;
}

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB safety cap per file

function sanitizeName(name: string): string {
  return (name || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 100);
}

export async function uploadToBucket(
  bucket: R2Bucket,
  file: File,
  prefix: string,
): Promise<UploadResult> {
  if (!file || typeof file === 'string' || file.size === 0) {
    throw new Error('No file provided.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File is too large (max 200 MB).');
  }
  const clean = sanitizeName(file.name);
  const key = `${prefix}/${crypto.randomUUID()}-${clean}`;
  await bucket.put(key, file, {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });
  return { key, filename: clean, size: file.size, contentType: file.type || 'application/octet-stream' };
}
