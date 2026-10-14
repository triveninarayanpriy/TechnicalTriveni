import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { addContactMessage, getSetting } from '../../lib/db';
import { verifyCsrf, rateLimit, clientIp } from '../../lib/auth';
import { verifyTurnstile } from '../../lib/turnstile';
import { sendEmail, escapeHtml } from '../../lib/email';
import { sendContactNotification, isAutoAckEnabled } from '../../lib/contact-notify';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const redirect = (to: string) => new Response(null, { status: 303, headers: { Location: to } });

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const ip = clientIp(request);

  // 1. CSRF (double-submit cookie)
  if (!verifyCsrf(cookies, String(form.get('csrf') || ''))) {
    return redirect('/contact?error=csrf');
  }

  // 2. Honeypot — silently accept & drop bot submissions (fool bots, return success).
  const honeypot = String(form.get('company') || '').trim();
  if (honeypot) {
    console.log('[Contact] Bot submission dropped via honeypot');
    return redirect('/contact?sent=1');
  }

  // 3. Validation & Sanitization
  const name = String(form.get('name') || '').trim().slice(0, 80);
  const email = String(form.get('email') || '').trim().toLowerCase().slice(0, 200);
  const subjectRaw = String(form.get('subject') || '').trim().slice(0, 120);
  const topic = String(form.get('topic') || '').trim().slice(0, 50);
  const orderId = String(form.get('order_id') || '').trim().slice(0, 50);
  const sourcePage = String(form.get('source_page') || '').trim().slice(0, 150) || request.headers.get('referer') || '/contact';
  const rawMessage = String(form.get('message') || '').trim().slice(0, 4000);

  if (!name || !EMAIL_RE.test(email) || !rawMessage) {
    return redirect('/contact?error=invalid');
  }

  // 4. Rate Limiting: 5 per hour per IP and per Email
  // 3600 seconds = 1 hour window
  const rlIp = await rateLimit(env, `contact_ip:${ip}`, 5, 3600);
  if (!rlIp.ok) {
    console.warn('[Contact] Rate limit exceeded for IP');
    return redirect('/contact?error=rate');
  }

  const rlEmail = await rateLimit(env, `contact_email:${email}`, 5, 3600);
  if (!rlEmail.ok) {
    console.warn('[Contact] Rate limit exceeded for email');
    return redirect('/contact?error=rate');
  }

  // 5. Turnstile (if configured)
  const tsToken = String(form.get('cf-turnstile-response') || '');
  if (!(await verifyTurnstile(env, tsToken, ip))) {
    return redirect('/contact?error=captcha');
  }

  // 6. Format message body if topic or orderId supplied
  let formattedMessage = rawMessage;
  if (topic || orderId) {
    const metaHeader = [
      topic ? `Topic: ${topic}` : null,
      orderId ? `Order ID: ${orderId}` : null,
    ].filter(Boolean).join('\n');
    formattedMessage = `${metaHeader}\n\n${rawMessage}`;
  }

  // 7. Save message FIRST in database
  let messageId = 0;
  try {
    messageId = await addContactMessage(env.DB, {
      name,
      email,
      subject: subjectRaw || 'General Inquiry',
      message: formattedMessage,
      order_id: orderId,
      source_page: sourcePage,
      email_status: 'pending',
    });
  } catch (err: any) {
    console.error('[Contact] Failed to save message to database:', err.message);
    return redirect('/contact?error=server');
  }

  // 8. Send notification email to admin (best-effort: visitor sees success even if notification fails)
  const siteUrl = env.SITE_URL || new URL(request.url).origin;
  try {
    await sendContactNotification(
      env,
      env.DB,
      {
        id: messageId,
        name,
        email,
        subject: subjectRaw,
        message: formattedMessage,
        order_id: orderId,
        source_page: sourcePage,
        created_at: Math.floor(Date.now() / 1000),
      },
      siteUrl
    );
  } catch (err: any) {
    console.error(`[Contact] Notification step threw error for message id=${messageId}:`, err.message);
  }

  // 9. Optional visitor auto-acknowledgement (Requirement 6, off by default)
  const autoAck = await isAutoAckEnabled(env.DB);
  if (autoAck) {
    try {
      const replyTime = await getSetting(env.DB, 'reply_time');
      const replyTimeNote = replyTime ? `<p>We typically reply within <strong>${escapeHtml(replyTime)}</strong>.</p>` : '';
      const safeSubject = escapeHtml(subjectRaw || 'Your inquiry');
      const safeName = escapeHtml(name);

      const ackHtml = `
        <p>Hi ${safeName},</p>
        <p>Thank you for reaching out to Technical Triveni!</p>
        <p>We have received your message regarding "<strong>${safeSubject}</strong>".</p>
        ${replyTimeNote}
        <br/>
        <p>Best regards,</p>
        <p>Technical Triveni Team</p>
      `;

      await sendEmail(env, {
        to: email,
        subject: `Re: ${subjectRaw || 'Your inquiry'} - Received`,
        html: ackHtml,
      });
      console.log(`[Contact] Auto-acknowledgement sent to visitor for message id=${messageId}`);
    } catch (err: any) {
      console.error(`[Contact] Auto-ack failed for message id=${messageId}:`, err.message);
    }
  }

  // 10. Success redirect
  return redirect('/contact?sent=1');
};
