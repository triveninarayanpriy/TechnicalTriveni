import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { checkAdminCredentials, startSession, rateLimit, clientIp } from '../../../lib/auth';
import { csrfOk } from '../../../lib/admin';

const redirect = (to: string) => new Response(null, { status: 303, headers: { Location: to } });

/** Only allow internal redirect targets (prevent open redirects). */
function safeNext(next: string): string {
  return next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const next = safeNext(String(form.get('next') || '/admin'));

  if (!csrfOk(cookies, form)) return redirect('/admin/login?err=1');

  // Throttle brute-force attempts per IP.
  const rl = await rateLimit(env, `login:${clientIp(request)}`, 8, 300);
  if (!rl.ok) return redirect('/admin/login?err=1');

  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');

  const valid = await checkAdminCredentials(env, email, password);
  if (!valid) return redirect('/admin/login?err=1');

  await startSession(env, cookies, email.trim().toLowerCase());
  return redirect(next);
};
