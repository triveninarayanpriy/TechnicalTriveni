import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getOrdersByEmail } from '../../../lib/db';
import { signPayload } from '../../../lib/crypto';
import { sendEmail, buildMagicLinkEmail, emailEnabled } from '../../../lib/email';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TTL_SECONDS = 30 * 60; // 30 minutes

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string };
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email.' }, 400);

  // Generic response either way — never reveal whether an email has orders.
  const generic = { ok: true, message: 'If that email has purchases, a sign-in link is on its way.' };

  if (!emailEnabled(env)) {
    return json({ ok: false, message: 'Email delivery is not set up yet. Use the download link from your purchase, or contact us.' });
  }

  const orders = await getOrdersByEmail(env.DB, email);
  if (orders.length === 0) return json(generic); // silent no-op

  const token = await signPayload(env.SESSION_SECRET, { email, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS });
  const base = env.SITE_URL || new URL(request.url).origin;
  const magicUrl = new URL(`/account/downloads?token=${encodeURIComponent(token)}`, base).toString();
  const { subject, html } = buildMagicLinkEmail(magicUrl);
  await sendEmail(env, { to: email, subject, html });

  return json(generic);
};
