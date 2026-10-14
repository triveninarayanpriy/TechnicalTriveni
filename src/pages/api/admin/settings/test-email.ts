import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk, flashRedirect } from '../../../../lib/admin';
import { sendEmailWithDetails, shell, formatDateTimeIST } from '../../../../lib/email';
import { getNotificationRecipients, DEFAULT_NOTIFICATION_EMAIL } from '../../../../lib/contact-notify';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form, request)) {
    return new Response(JSON.stringify({ ok: false, error: 'Session expired or invalid CSRF.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const recipients = await getNotificationRecipients(env, env.DB);
  const istTime = formatDateTimeIST();
  const testSubject = `[Test Notification] Technical Triveni Contact System`;

  const html = shell('Test Notification Email', `
    <div style="margin:0 0 16px;padding:14px 18px;background:#eefbf3;border:1px solid #c3edd2;border-radius:10px;">
      <p style="margin:0 0 6px;color:#0e8f4f;font-weight:700;font-size:15px;">✓ Your contact notification system is working!</p>
      <p style="margin:0;color:#1e4620;font-size:13.5px;line-height:1.5;">
        This test confirms that new visitor messages sent from the website contact form will be delivered to this inbox.
      </p>
    </div>

    <table style="width:100%;font-size:13.5px;line-height:1.6;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="width:120px;color:#6b7280;font-weight:600;padding:4px 0;">Recipients:</td>
        <td style="color:#111827;padding:4px 0;"><code>${recipients.join(', ')}</code></td>
      </tr>
      <tr>
        <td style="color:#6b7280;font-weight:600;padding:4px 0;">Sending From:</td>
        <td style="color:#111827;padding:4px 0;"><code>${env.FROM_EMAIL || 'technicaltriveniyt@gmail.com'}</code></td>
      </tr>
      <tr>
        <td style="color:#6b7280;font-weight:600;padding:4px 0;">Time (IST):</td>
        <td style="color:#111827;padding:4px 0;">${istTime}</td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:#8a90a2;line-height:1.5;">
      Triggered from Admin &gt; Settings &gt; Notifications.
    </p>
  `);

  const text = `Test Notification Email - Technical Triveni
--------------------------------------------------
Your contact notification system is working correctly.

Recipients: ${recipients.join(', ')}
From: ${env.FROM_EMAIL || 'technicaltriveniyt@gmail.com'}
Time (IST): ${istTime}

Triggered from Admin > Settings > Notifications.
`;

  const res = await sendEmailWithDetails(env, {
    to: recipients,
    subject: testSubject,
    html,
    text,
  });

  const wantsJson = request.headers.get('accept')?.includes('application/json');

  if (res.ok) {
    if (wantsJson) {
      return new Response(JSON.stringify({ ok: true, message: `Test email sent to ${recipients.join(', ')}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return flashRedirect('/admin/settings', { ok: `Test email sent to ${recipients.join(', ')}` });
  } else {
    const err = res.error || 'Failed to send test email. Check Brevo configuration.';
    if (wantsJson) {
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return flashRedirect('/admin/settings', { err });
  }
};
