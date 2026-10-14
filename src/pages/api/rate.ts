import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { sendEmailWithDetails, shell, formatDateTimeIST } from '../../lib/email';
import { getNotificationRecipients, isNotificationEnabled } from '../../lib/contact-notify';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  const rating = parseInt(url.searchParams.get('rating') || '0', 10);

  if (!orderId || !rating || rating < 1 || rating > 5) {
    return new Response('Invalid request', { status: 400 });
  }

  try {
    const db = env.DB;
    // Update the rating
    const res = await db.prepare('UPDATE orders SET rating = ? WHERE id = ?').bind(rating, orderId).run();
    
    if (res.meta.changes === 0) {
      return new Response('Order not found', { status: 404 });
    }

    // Best-effort admin notification if notifications are enabled
    const notifyOn = await isNotificationEnabled(db);
    if (notifyOn) {
      try {
        const order = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first<any>();
        if (order) {
          const recipients = await getNotificationRecipients(env, db);
          const stars = '⭐'.repeat(rating);
          const istTime = formatDateTimeIST();
          const adminUrl = `${env.SITE_URL || 'https://www.technicaltriveni.me'}/admin/orders`;

          const html = shell(`New Rating: ${stars}`, `
            <div style="margin:0 0 16px;padding:12px 16px;background:#f8f9fb;border:1px solid #e2e5eb;border-radius:10px;">
              <p style="margin:0 0 8px;font-size:16px;color:#111827;"><strong>${stars} (${rating} / 5 stars)</strong></p>
              <table style="width:100%;font-size:13.5px;line-height:1.6;border-collapse:collapse;">
                <tr>
                  <td style="width:110px;color:#6b7280;font-weight:600;padding:3px 0;">Project:</td>
                  <td style="color:#111827;padding:3px 0;"><strong>${order.project_title || 'Project'}</strong></td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-weight:600;padding:3px 0;">Customer:</td>
                  <td style="color:#111827;padding:3px 0;">${order.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-weight:600;padding:3px 0;">Order ID:</td>
                  <td style="color:#111827;padding:3px 0;"><code>${order.id}</code></td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-weight:600;padding:3px 0;">Time (IST):</td>
                  <td style="color:#111827;padding:3px 0;">${istTime}</td>
                </tr>
              </table>
            </div>
            <p style="margin:20px 0 0;">
              <a href="${adminUrl}" style="display:inline-block;background:#e7242a;color:#fff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:8px;font-size:14px;">Open Orders in Admin &rarr;</a>
            </p>
          `);

          const text = `New Project Rating: ${rating}/5 stars (${stars})
Project: ${order.project_title}
Customer: ${order.email}
Order ID: ${order.id}
Time (IST): ${istTime}

View in Admin: ${adminUrl}
`;

          await sendEmailWithDetails(env, {
            to: recipients,
            subject: `New Rating: ${stars} for ${order.project_title}`,
            html,
            text,
          });
          console.log(`[Rate] Admin notification sent for order id=${orderId}`);
        }
      } catch (err: any) {
        console.error(`[Rate] Failed to send admin notification for order id=${orderId}:`, err.message);
      }
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rating Submitted</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 4rem 1rem; color: #151314; }
          .icon { color: #10b981; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <h1>Thank You!</h1>
        <p>Your rating of ${rating} stars has been recorded.</p>
        <a href="/" style="display: inline-block; margin-top: 1rem; color: #E92424; text-decoration: none; font-weight: 600;">Return to homepage</a>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    return new Response('Internal error: ' + err.message, { status: 500 });
  }
};
