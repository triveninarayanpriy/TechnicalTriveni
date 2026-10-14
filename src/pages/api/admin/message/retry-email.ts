import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk, flashRedirect } from '../../../../lib/admin';
import { getContactMessageById } from '../../../../lib/db';
import { sendContactNotification } from '../../../../lib/contact-notify';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form, request)) {
    return new Response(JSON.stringify({ ok: false, error: 'Session expired or invalid CSRF.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = Number(form.get('id') || 0);
  if (!id) {
    return new Response(JSON.stringify({ ok: false, error: 'Message ID is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const msg = await getContactMessageById(env.DB, id);
  if (!msg) {
    return new Response(JSON.stringify({ ok: false, error: 'Message not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const siteUrl = env.SITE_URL || new URL(request.url).origin;
  const res = await sendContactNotification(env, env.DB, msg, siteUrl);

  const wantsJson = request.headers.get('accept')?.includes('application/json');

  if (res.ok && res.status === 'sent') {
    if (wantsJson) {
      return new Response(JSON.stringify({ ok: true, message: 'Notification email sent successfully.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return flashRedirect(`/admin/messages?id=${id}`, { ok: 'Notification email sent successfully.' });
  } else if (res.status === 'skipped') {
    if (wantsJson) {
      return new Response(JSON.stringify({ ok: false, message: 'Email notifications are disabled in Settings.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return flashRedirect(`/admin/messages?id=${id}`, { err: 'Email notifications are disabled in Settings.' });
  } else {
    const err = res.error || 'Failed to send notification email.';
    if (wantsJson) {
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return flashRedirect(`/admin/messages?id=${id}`, { err });
  }
};
