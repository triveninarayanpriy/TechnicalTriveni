import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateContactMessage } from '../../../../lib/db';
import { sendEmail } from '../../../../lib/email';
import { csrfOk, intField, strField, flashRedirect } from '../../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/messages', { err: 'Session expired.' });

  const id = intField(form, 'id', 0);
  const email = strField(form, 'email', 255);
  const subject = strField(form, 'subject', 255) || 'Re: Your message';
  const reply_body = strField(form, 'reply_body', 10000);

  if (!id || !email || !reply_body) {
    return flashRedirect('/admin/messages', { err: 'Missing required fields.' });
  }

  const replyHtml = `<p>${reply_body.replace(/\n/g, '<br>')}</p>`;

  const sent = await sendEmail(env, {
    to: email,
    subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
    html: replyHtml
  });

  if (sent) {
    await updateContactMessage(env.DB, id, { status: 'replied', reply_body });
    return flashRedirect('/admin/messages', { ok: 'Reply sent successfully.' });
  } else {
    return flashRedirect('/admin/messages', { err: 'Failed to send email.' });
  }
};
