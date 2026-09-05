/**
 * Authentication & session management for the admin panel.
 *
 * Design:
 *  - Admin credentials live in secrets (ADMIN_EMAIL + ADMIN_PASSWORD_HASH),
 *    never in the database or code. The password is verified with PBKDF2.
 *  - Sessions are stateless, signed tokens stored in an HttpOnly cookie.
 *  - CSRF uses the double-submit-cookie pattern for all admin mutations.
 */
import type { AstroCookies } from 'astro';
import { signPayload, verifyPayload, verifyPassword, randomToken, timingSafeEqual } from './crypto';

export const SESSION_COOKIE = 'tt_session';
export const CSRF_COOKIE = 'tt_csrf';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminSession {
  email: string;
  iat: number;
  exp: number;
}

const secureCookie = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

/** Verify an email/password pair against the configured admin secrets. */
export async function checkAdminCredentials(env: Env, email: string, password: string): Promise<boolean> {
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = env.ADMIN_PASSWORD_HASH?.trim();
  if (!adminEmail || !hash) return false;
  const emailOk = timingSafeEqual(email.trim().toLowerCase(), adminEmail);
  const passOk = await verifyPassword(password, hash);
  // Evaluate both regardless of the email result to keep timing uniform.
  return emailOk && passOk;
}

/** Create a signed session token + set the cookie. */
export async function startSession(env: Env, cookies: AstroCookies, email: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const token = await signPayload(env.SESSION_SECRET, {
    email,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  } satisfies AdminSession);
  cookies.set(SESSION_COOKIE, token, { ...secureCookie, maxAge: SESSION_TTL_SECONDS });
}

/** Read & validate the current admin session, or null. */
export async function getSession(env: Env, cookies: AstroCookies): Promise<{ email: string } | null> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyPayload<AdminSession>(env.SESSION_SECRET, token);
  if (!payload) return null;
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return { email: payload.email };
}

export function endSession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

/* --------------------------------------------------------------------- CSRF */

/** Ensure a CSRF token cookie exists; returns the current token. */
export function ensureCsrfToken(cookies: AstroCookies): string {
  let token = cookies.get(CSRF_COOKIE)?.value;
  if (!token) {
    token = randomToken(24);
    // Not HttpOnly: the token must be readable to embed in forms/headers,
    // which is exactly how the double-submit pattern works.
    cookies.set(CSRF_COOKIE, token, {
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });
  }
  return token;
}

/** Validate a submitted CSRF token against the cookie. */
export function verifyCsrf(cookies: AstroCookies, submitted: string | null | undefined): boolean {
  const cookieToken = cookies.get(CSRF_COOKIE)?.value;
  if (!cookieToken || !submitted) return false;
  return timingSafeEqual(cookieToken, submitted);
}

/** Resolve the client IP on Cloudflare (falls back gracefully). */
export function clientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/* ------------------------------------------------------------- rate limit */

/**
 * A tiny, best-effort rate limiter backed by KV when available.
 * Returns { ok, remaining }. Degrades to "always allow" when KV is absent
 * (e.g. local dev without a KV namespace) so the app never hard-fails.
 */
export async function rateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; remaining: number }> {
  if (!env.KV) return { ok: true, remaining: limit };
  const bucket = `rl:${key}`;
  try {
    const raw = await env.KV.get(bucket);
    const count = raw ? parseInt(raw, 10) : 0;
    if (count >= limit) return { ok: false, remaining: 0 };
    await env.KV.put(bucket, String(count + 1), { expirationTtl: windowSeconds });
    return { ok: true, remaining: limit - count - 1 };
  } catch {
    return { ok: true, remaining: limit };
  }
}
