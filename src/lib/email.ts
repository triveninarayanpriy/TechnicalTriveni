/**
 * Transactional email via Brevo (free tier: 300/day, single verified sender).
 * Works with a plain Gmail address, no custom domain required.
 *
 * Everything is best-effort: a failed send never breaks a payment or a page.
 * Sending is inert until EMAIL_ENABLED === 'true' and a BREVO_API_KEY + FROM_EMAIL
 * are configured, so the code can ship before the account is set up.
 */
import type { Order } from './db.ts';
import { formatINR } from './format.ts';

export function emailEnabled(env: Env): boolean {
  return env.EMAIL_ENABLED === 'true' && !!env.BREVO_API_KEY && !!env.FROM_EMAIL;
}

export interface Mail {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: { email: string; name?: string };
}

/** HTML escaping utility to prevent HTML injection in emails. */
export function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Sanitize header values to prevent header injection (CRLF injection). */
export function cleanHeaderValue(str: string): string {
  return String(str ?? '').replace(/[\r\n\x00-\x1f\x7f]+/g, ' ').trim();
}

/** Format timestamp in Indian Standard Time (Asia/Kolkata). */
export function formatDateTimeIST(ts: number | Date = Date.now()): string {
  const d = typeof ts === 'number' ? new Date(ts < 1e12 ? ts * 1000 : ts) : ts;
  return (
    d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' IST'
  );
}

/** Send email with full detail report (error message, Brevo response ID). */
export async function sendEmailWithDetails(
  env: Env,
  mail: Mail
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  if (!emailEnabled(env)) {
    return { ok: false, error: 'Email sending is disabled or credentials missing' };
  }
  try {
    const toList = Array.isArray(mail.to) ? mail.to : [mail.to];
    const toPayload = toList
      .map((t) => ({ email: t.trim() }))
      .filter((t) => t.email.length > 0);

    if (!toPayload.length) {
      return { ok: false, error: 'No recipient email specified' };
    }

    const payload: any = {
      sender: { email: env.FROM_EMAIL, name: env.FROM_NAME || 'Technical Triveni' },
      to: toPayload,
      subject: mail.subject,
      htmlContent: mail.html,
    };
    if (mail.text) {
      payload.textContent = mail.text;
    }
    if (mail.replyTo && mail.replyTo.email) {
      payload.replyTo = {
        email: cleanHeaderValue(mail.replyTo.email),
        name: cleanHeaderValue(mail.replyTo.name || mail.replyTo.email),
      };
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY as string,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Brevo HTTP ${res.status}: ${errText.slice(0, 300)}` };
    }
    const data = (await res.json().catch(() => ({}))) as any;
    return { ok: true, messageId: data.messageId };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Unknown network error' };
  }
}

/** Backward-compatible standard sendEmail */
export async function sendEmail(env: Env, mail: Mail): Promise<boolean> {
  const res = await sendEmailWithDetails(env, mail);
  return res.ok;
}

/* --------------------------------------------------------------- templates --- */

const BRAND = '#e7242a';

export function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#f5f6f8;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14161c">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6e8ee">
    <tr><td style="background:${BRAND};padding:18px 24px;color:#fff;font-weight:700;font-size:18px;letter-spacing:.3px">Technical Triveni</td></tr>
    <tr><td style="padding:28px 24px">
      <h1 style="margin:0 0 14px;font-size:20px">${title}</h1>
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:16px 24px;border-top:1px solid #eef0f4;color:#8a90a2;font-size:12px">
      Electronics &#x2022; Software &#x2022; AI &mdash; <a href="https://www.technicaltriveni.me" style="color:#8a90a2;text-decoration:underline">technicaltriveni.me</a>
    </td></tr>
  </table></body></html>`;
}

export function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:9px;font-size:15px">${label}</a>`;
}

/** Receipt + secure download link sent right after a successful purchase. */
export function buildOrderEmail(order: Order, downloadUrl: string): { subject: string; html: string } {
  // Fix URL domain just in case it was generated with .com locally or by a worker
  const safeUrl = downloadUrl.replace('technicaltriveni.com', 'technicaltriveni.me');
  
  const rupees = formatINR(order.amount_inr);
  return {
    subject: `Your download - ${order.project_title}`,
    html: shell('Thank you for your purchase!', `
      <p style="margin:0 0 16px;line-height:1.6">Your payment of <strong>${rupees}</strong> for
      <strong>${order.project_title}</strong> was successful. Here is your secure download:</p>
      <p style="margin:0 0 22px">${button(safeUrl, 'Download your files')}</p>
      <p style="margin:0 0 8px;color:#5a6072;font-size:13px;line-height:1.6">This link is private to you &mdash; keep it safe.
      You can re-access all your downloads any time from <a href="https://www.technicaltriveni.me/account/downloads" style="color:${BRAND}">My downloads</a> using this email.</p>
      
        <div style="border-top:1px solid #e1e4e8;margin:24px 0;padding-top:24px;">
          <p style="margin:0 0 8px;font-size:15px;font-weight:600">Rate this project</p>
          <p style="margin:0 0 12px;color:#5a6072;font-size:13px;">Help others by rating this pack. Just one click!</p>
          <p style="margin:0 0 16px;">
            <a href="https://www.technicaltriveni.me/api/rate?order_id=${order.id}&rating=1" style="font-size:24px;text-decoration:none;margin-right:4px;">⭐</a>
            <a href="https://www.technicaltriveni.me/api/rate?order_id=${order.id}&rating=2" style="font-size:24px;text-decoration:none;margin-right:4px;">⭐</a>
            <a href="https://www.technicaltriveni.me/api/rate?order_id=${order.id}&rating=3" style="font-size:24px;text-decoration:none;margin-right:4px;">⭐</a>
            <a href="https://www.technicaltriveni.me/api/rate?order_id=${order.id}&rating=4" style="font-size:24px;text-decoration:none;margin-right:4px;">⭐</a>
            <a href="https://www.technicaltriveni.me/api/rate?order_id=${order.id}&rating=5" style="font-size:24px;text-decoration:none;">⭐</a>
          </p>
        </div>
        <p style="margin:18px 0 0;color:#8a90a2;font-size:12px">Order ${order.id}</p>
    `),
  };
}

/** Refund confirmation email sent when an order is refunded via Razorpay. */
export function buildRefundEmail(order: Order, refundId: string): { subject: string; html: string } {
  const rupees = formatINR(order.amount_inr);
  return {
    subject: `Refund processed - ${order.project_title}`,
    html: shell('Your refund has been processed', `
      <p style="margin:0 0 16px;line-height:1.6">Your refund of <strong>${rupees}</strong> for
      <strong>${order.project_title}</strong> has been issued through Razorpay.</p>
      <p style="margin:0 0 16px;color:#5a6072;font-size:14px;line-height:1.6">Refund ID: <code>${refundId}</code></p>
      <p style="margin:0 0 8px;color:#5a6072;font-size:13px;line-height:1.6">It typically takes 5–7 business days for the credit to appear on your original payment method statement.</p>
      <p style="margin:18px 0 0;color:#8a90a2;font-size:12px">Order ${order.id}</p>
    `),
  };
}

/** Passwordless "My downloads" access link. */
export function buildMagicLinkEmail(magicUrl: string): { subject: string; html: string } {
  const safeUrl = magicUrl.replace('technicaltriveni.com', 'technicaltriveni.me');
  return {
    subject: 'Your Technical Triveni downloads',
    html: shell('Access your downloads', `
      <p style="margin:0 0 16px;line-height:1.6">Click below to see every project you've purchased and re-download the files.
      This link works for 30 minutes.</p>
      <p style="margin:0 0 22px">${button(safeUrl, 'View my downloads')}</p>
      <p style="margin:0;color:#8a90a2;font-size:12px;line-height:1.6">If you didn't request this, you can safely ignore it &mdash; no one else can see your downloads.</p>
    `),
  };
}

export interface ContactNotificationData {
  messageId: number | string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  orderId?: string;
  topic?: string;
  sourcePage?: string;
  createdAt?: number;
  siteUrl?: string;
}

/**
 * Build notification email sent to admin when a visitor submits the contact form.
 * Follows Requirement 4:
 * - subject: "New message from <name>: <first 60 chars>"
 * - Reply-To: visitor's email
 * - From: site's sending address
 * - Body: name, email, message, order ID, page sent from, time in IST, Open in admin button
 * - HTML and Plain text, all values safely escaped.
 */
export function buildContactNotificationEmail(data: ContactNotificationData): {
  subject: string;
  html: string;
  text: string;
  replyTo: { email: string; name: string };
} {
  const cleanName = cleanHeaderValue(data.name) || 'Visitor';
  const cleanVisitorEmail = cleanHeaderValue(data.email);

  const snippetRaw = (data.subject && data.subject.trim()) || data.message || '';
  const first60 = cleanHeaderValue(snippetRaw).slice(0, 60);
  const subject = `New message from ${cleanName}: ${first60}`;

  const istTime = formatDateTimeIST(data.createdAt || Date.now());
  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanVisitorEmail);
  const safeTopic = escapeHtml(data.topic || '');
  const safeOrderId = escapeHtml(data.orderId || '');
  const safeSource = escapeHtml(data.sourcePage || '/contact');
  const safeMessageHtml = escapeHtml(data.message).replace(/\n/g, '<br/>');

  const baseSite = (data.siteUrl || 'https://www.technicaltriveni.me').replace(/\/+$/, '');
  const adminUrl = `${baseSite}/admin/messages?id=${data.messageId}`;

  const html = shell(`New Message from ${safeName}`, `
    <div style="margin:0 0 16px;padding:12px 16px;background:#f8f9fb;border:1px solid #e2e5eb;border-radius:10px;">
      <table style="width:100%;font-size:14px;line-height:1.6;border-collapse:collapse;">
        <tr>
          <td style="width:100px;color:#6b7280;font-weight:600;padding:4px 0;">From:</td>
          <td style="color:#111827;padding:4px 0;"><strong>${safeName}</strong> &lt;<a href="mailto:${safeEmail}" style="color:#e7242a;text-decoration:none;">${safeEmail}</a>&gt;</td>
        </tr>
        ${data.topic ? `
        <tr>
          <td style="color:#6b7280;font-weight:600;padding:4px 0;">Topic:</td>
          <td style="color:#111827;padding:4px 0;">${safeTopic}</td>
        </tr>` : ''}
        ${data.orderId ? `
        <tr>
          <td style="color:#6b7280;font-weight:600;padding:4px 0;">Order ID:</td>
          <td style="color:#111827;padding:4px 0;"><code>${safeOrderId}</code></td>
        </tr>` : ''}
        <tr>
          <td style="color:#6b7280;font-weight:600;padding:4px 0;">Source page:</td>
          <td style="color:#111827;padding:4px 0;">${safeSource}</td>
        </tr>
        <tr>
          <td style="color:#6b7280;font-weight:600;padding:4px 0;">Time (IST):</td>
          <td style="color:#111827;padding:4px 0;">${istTime}</td>
        </tr>
      </table>
    </div>

    <div style="margin:20px 0;">
      <h3 style="margin:0 0 8px;font-size:15px;color:#374151;">Message:</h3>
      <div style="background:#fff;border:1px solid #e5e7eb;border-left:4px solid #e7242a;padding:14px 16px;border-radius:6px;font-size:14px;line-height:1.6;color:#1f2937;word-break:break-word;">
        ${safeMessageHtml}
      </div>
    </div>

    <p style="margin:24px 0 16px;">
      ${button(adminUrl, 'Open in admin &rarr;')}
    </p>
    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">
      Hit <strong>Reply</strong> in your email client to respond directly to ${safeName} (${safeEmail}).
    </p>
  `);

  const text = `New message from ${cleanName} <${cleanVisitorEmail}>
Time (IST): ${istTime}
Source Page: ${data.sourcePage || '/contact'}
${data.topic ? `Topic: ${data.topic}\n` : ''}${data.orderId ? `Order ID: ${data.orderId}\n` : ''}
Message:
----------------------------------------
${data.message}
----------------------------------------

Open in admin:
${adminUrl}

Reply to this email to reply directly to ${cleanVisitorEmail}.
`;

  return {
    subject,
    html,
    text,
    replyTo: { email: cleanVisitorEmail, name: cleanName },
  };
}
