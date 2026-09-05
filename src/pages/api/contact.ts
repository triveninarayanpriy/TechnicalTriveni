import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addContactMessage } from '../../lib/db';
import { verifyCsrf, rateLimit, clientIp } from '../../lib/auth';
import { verifyTurnstile } from '../../lib/turnstile';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const redirect = (to: string) => new Response(null, { status: 303, headers: { Location: to } });

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const ip = clientIp(request);

  // CSRF (double-submit cookie)
  if (!verifyCsrf(cookies, String(form.get('csrf') || ''))) {
    return redirect('/contact?error=csrf');
  }

  // Honeypot — silently accept & drop bot submissions.
  if (String(form.get('company') || '').trim()) {
    return redirect('/contact?sent=1');
  }

  // Rate limit
  const rl = await rateLimit(env, `contact:${ip}`, 5, 300);
  if (!rl.ok) return redirect('/contact?error=rate');

  // Turnstile (if configured)
  const tsToken = String(form.get('cf-turnstile-response') || '');
  if (!(await verifyTurnstile(env, tsToken, ip))) {
    return redirect('/contact?error=captcha');
  }

  const name = String(form.get('name') || '').trim().slice(0, 80);
  const email = String(form.get('email') || '').trim().slice(0, 200);
  const subject = String(form.get('subject') || '').trim().slice(0, 120);
  const message = String(form.get('message') || '').trim().slice(0, 4000);

  if (!name || !EMAIL_RE.test(email) || !message) {
    return redirect('/contact?error=invalid');
  }

  await addContactMessage(env.DB, { name, email, subject, message });
  return redirect('/contact?sent=1');
};
