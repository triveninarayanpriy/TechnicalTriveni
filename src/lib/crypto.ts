/**
 * Cryptographic helpers built on the Web Crypto API (available in both the
 * Cloudflare Workers runtime and Node 20+). No Node-only dependencies.
 */

const enc = new TextEncoder();

/* ------------------------------------------------------------ base64url --- */
export function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ------------------------------------------------------- random tokens ---- */
export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return toBase64Url(buf);
}

/** Constant-time string comparison to avoid timing attacks. */
export function timingSafeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

/* ------------------------------------------------------------- HMAC-SHA256 - */
async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toBase64Url(sig);
}

export async function hmacVerify(secret: string, message: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(secret, message);
  return timingSafeEqual(expected, signature);
}

/** Hex-encoded HMAC — Razorpay verifies signatures in hex, not base64. */
export async function hmacSignHex(secret: string, message: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ------------------------------------------------ password hashing (PBKDF2) */
// Cloudflare Workers caps PBKDF2 at 100,000 iterations (hard platform limit).
// Combined with a strong random admin password + login rate limiting, this is
// a sound work factor for a single-admin CMS.
const PBKDF2_ITERATIONS = 100_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, iterStr, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = parseInt(iterStr, 10);
    const salt = fromBase64Url(saltB64);
    const expected = fromBase64Url(hashB64);
    const actual = await pbkdf2(password, salt, iterations, expected.length);
    return timingSafeEqual(toBase64Url(actual), toBase64Url(expected));
  } catch {
    return false;
  }
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number, length = 32): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

/* ------------------------------------------------------ signed payloads ---- */
/** Sign a JSON payload into a compact `<data>.<sig>` token. */
export async function signPayload(secret: string, payload: Record<string, unknown>): Promise<string> {
  const data = toBase64Url(enc.encode(JSON.stringify(payload)));
  const sig = await hmacSign(secret, data);
  return `${data}.${sig}`;
}

/** Verify & decode a token produced by `signPayload`. Returns null if invalid. */
export async function verifyPayload<T = Record<string, unknown>>(
  secret: string,
  token: string,
): Promise<T | null> {
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!(await hmacVerify(secret, data, sig))) return null;
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(data))) as T;
  } catch {
    return null;
  }
}
