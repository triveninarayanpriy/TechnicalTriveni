/**
 * Transactional email via Brevo (free tier: 300/day, single verified sender —
 * works with a plain Gmail address, no custom domain required).
 *
 * Everything is best-effort: a failed send never breaks a payment or a page.
 * Sending is inert until EMAIL_ENABLED === 'true' and a BREVO_API_KEY + FROM_EMAIL
 * are configured, so the code can ship before the account is set up.
 */
import type { Order } from './db';

export function emailEnabled(env: Env): boolean {
  return env.EMAIL_ENABLED === 'true' && !!env.BREVO_API_KEY && !!env.FROM_EMAIL;
}

interface Mail {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(env: Env, mail: Mail): Promise<boolean> {
  if (!emailEnabled(env)) return false;
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY as string,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: env.FROM_EMAIL, name: env.FROM_NAME || 'Technical Triveni' },
        to: [{ email: mail.to }],
        subject: mail.subject,
        htmlContent: mail.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------- templates --- */

const BRAND = '#e7242a';

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#f5f6f8;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14161c">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6e8ee">
    <tr><td style="background:${BRAND};padding:18px 24px;color:#fff;font-weight:700;font-size:18px;letter-spacing:.3px">Technical Triveni</td></tr>
    <tr><td style="padding:28px 24px">
      <h1 style="margin:0 0 14px;font-size:20px">${title}</h1>
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:16px 24px;border-top:1px solid #eef0f4;color:#8a90a2;font-size:12px">
      Electronics · Software · AI — <a href="https://technicaltriveni.me" style="color:#8a90a2;text-decoration:underline">technicaltriveni.me</a>
    </td></tr>
  </table></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:9px;font-size:15px">${label}</a>`;
}

/** Receipt + secure download link sent right after a successful purchase. */
export function buildOrderEmail(order: Order, downloadUrl: string): { subject: string; html: string } {
  const rupees = `₹${order.amount_inr}`;
  return {
    subject: `Your download — ${order.project_title}`,
    html: shell('Thank you for your purchase! 🎉', `
      <p style="margin:0 0 16px;line-height:1.6">Your payment of <strong>${rupees}</strong> for
      <strong>${order.project_title}</strong> was successful. Here's your secure download:</p>
      <p style="margin:0 0 22px">${button(downloadUrl, 'Download your files')}</p>
      <p style="margin:0 0 8px;color:#5a6072;font-size:13px;line-height:1.6">This link is private to you — keep it safe.
      You can re-access all your downloads any time from <a href="https://technicaltriveni.me/account/downloads" style="color:${BRAND}">My downloads</a> using this email.</p>
      <p style="margin:18px 0 0;color:#8a90a2;font-size:12px">Order ${order.id}</p>
    `),
  };
}

/** Passwordless "My downloads" access link. */
export function buildMagicLinkEmail(magicUrl: string): { subject: string; html: string } {
  return {
    subject: 'Your Technical Triveni downloads',
    html: shell('Access your downloads', `
      <p style="margin:0 0 16px;line-height:1.6">Click below to see every project you've purchased and re-download the files.
      This link works for 30 minutes.</p>
      <p style="margin:0 0 22px">${button(magicUrl, 'View my downloads')}</p>
      <p style="margin:0;color:#8a90a2;font-size:12px;line-height:1.6">If you didn't request this, you can safely ignore it — no one else can see your purchases.</p>
    `),
  };
}
