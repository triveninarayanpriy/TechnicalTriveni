/**
 * Cloudflare Turnstile — free, privacy-friendly bot protection.
 * Used on the contact form and admin login. When disabled, verification is
 * skipped so local development works without keys.
 */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileEnabled(env: Env): boolean {
  return env.TURNSTILE_ENABLED === 'true' && !!env.TURNSTILE_SITE_KEY && !!env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(env: Env, token: string | null, ip?: string | null): Promise<boolean> {
  if (!turnstileEnabled(env)) return true; // not configured → do not block
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
