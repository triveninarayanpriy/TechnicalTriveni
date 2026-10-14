/**
 * Contact notification delivery and management.
 * Handles notifying administrators when contact messages or website form inquiries arrive,
 * delivery tracking, and retrying failed deliveries with backoff.
 * 
 * SAFETY RULE: Never log full message bodies or customer email addresses. Log IDs and statuses only.
 */
import type { D1Database } from '@cloudflare/workers-types';
import { getSetting } from './db.ts';
import { sendEmailWithDetails, buildContactNotificationEmail } from './email.ts';

export interface ContactRecord {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: number;
  order_id?: string;
  source_page?: string;
  email_status?: 'sent' | 'failed' | 'skipped' | 'pending';
  email_sent_at?: number | null;
  email_error?: string | null;
  email_attempts?: number;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const DEFAULT_NOTIFICATION_EMAIL = 'technicaltriveniyt@gmail.com';

/**
 * Get notification email addresses from Settings > Notifications > "Message notification email"
 * with fallback to NOTIFICATION_EMAIL / CONTACT_NOTIFICATION_EMAIL env vars or default.
 */
export async function getNotificationRecipients(env: Env, db: D1Database): Promise<string[]> {
  try {
    const rawSetting = await getSetting(db, 'contact_notification_email');
    const fallbackEnv = (env as any).NOTIFICATION_EMAIL || (env as any).CONTACT_NOTIFICATION_EMAIL;
    const source = (rawSetting && rawSetting.trim()) ? rawSetting : (fallbackEnv || DEFAULT_NOTIFICATION_EMAIL);
    
    const list = source
      .split(',')
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => EMAIL_RE.test(s));

    return list.length > 0 ? list : [DEFAULT_NOTIFICATION_EMAIL];
  } catch {
    return [DEFAULT_NOTIFICATION_EMAIL];
  }
}

/** Check if notification on/off switch is enabled (defaults to true). */
export async function isNotificationEnabled(db: D1Database): Promise<boolean> {
  try {
    const setting = await getSetting(db, 'contact_email_notify_enabled');
    // If not set, default to '1' (enabled)
    return setting === null || setting === undefined || setting === '' || setting === '1';
  } catch {
    return true;
  }
}

/** Check if automatic visitor acknowledgement is enabled (defaults to false). */
export async function isAutoAckEnabled(db: D1Database): Promise<boolean> {
  try {
    const setting = await getSetting(db, 'contact_autoack_enabled');
    return setting === '1';
  } catch {
    return false;
  }
}

/**
 * Send notification email for a contact message and record delivery status on the record.
 */
export async function sendContactNotification(
  env: Env,
  db: D1Database,
  msg: ContactRecord,
  siteUrl?: string
): Promise<{ ok: boolean; status: 'sent' | 'failed' | 'skipped'; error?: string }> {
  const currentAttempts = (msg.email_attempts || 0) + 1;
  const nowTs = Math.floor(Date.now() / 1000);

  // 1. Check if notifications are enabled
  const enabled = await isNotificationEnabled(db);
  if (!enabled) {
    try {
      await db.prepare(`
        UPDATE contact_messages
        SET email_status = 'skipped', email_error = 'Notifications disabled in settings'
        WHERE id = ?
      `).bind(msg.id).run();
    } catch {}
    console.log(`[ContactNotify] Message id=${msg.id} notification skipped (disabled in settings)`);
    return { ok: true, status: 'skipped' };
  }

  // 2. Fetch recipients
  const recipients = await getNotificationRecipients(env, db);
  if (!recipients.length) {
    const err = 'No valid recipient email address configured';
    await recordFailure(db, msg.id, currentAttempts, err);
    console.error(`[ContactNotify] Message id=${msg.id} notification failed: ${err}`);
    return { ok: false, status: 'failed', error: err };
  }

  // 3. Build email with Reply-To visitor and HTML/plain text body
  const mailContent = buildContactNotificationEmail({
    messageId: msg.id,
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    orderId: msg.order_id,
    sourcePage: msg.source_page || '/contact',
    createdAt: msg.created_at,
    siteUrl: siteUrl || env.SITE_URL || 'https://www.technicaltriveni.me',
  });

  // 4. Send via Brevo
  const res = await sendEmailWithDetails(env, {
    to: recipients,
    subject: mailContent.subject,
    html: mailContent.html,
    text: mailContent.text,
    replyTo: mailContent.replyTo,
  });

  if (res.ok) {
    try {
      await db.prepare(`
        UPDATE contact_messages
        SET email_status = 'sent', email_sent_at = ?, email_error = '', email_attempts = ?
        WHERE id = ?
      `).bind(nowTs, currentAttempts, msg.id).run();
    } catch {}
    console.log(`[ContactNotify] Message id=${msg.id} notification sent successfully (attempt ${currentAttempts})`);
    return { ok: true, status: 'sent' };
  } else {
    const err = res.error || 'Failed to send notification email';
    await recordFailure(db, msg.id, currentAttempts, err);
    console.error(`[ContactNotify] Message id=${msg.id} notification failed (attempt ${currentAttempts}): ${err}`);
    return { ok: false, status: 'failed', error: err };
  }
}

async function recordFailure(db: D1Database, id: number, attempts: number, err: string): Promise<void> {
  try {
    await db.prepare(`
      UPDATE contact_messages
      SET email_status = 'failed', email_error = ?, email_attempts = ?
      WHERE id = ?
    `).bind(err.slice(0, 500), attempts, id).run();
  } catch {}
}

/**
 * Retry failed deliveries automatically (up to 3 tries with backoff).
 * Backoff schedule:
 * - Attempt 1: retry after 2 minutes (120s)
 * - Attempt 2: retry after 10 minutes (600s)
 * - Attempt 3: retry after 30 minutes (1800s)
 */
export async function retryFailedContactNotifications(
  env: Env,
  db: D1Database,
  siteUrl?: string
): Promise<{ retried: number; succeeded: number; failed: number }> {
  let retried = 0;
  let succeeded = 0;
  let failed = 0;

  try {
    const failedMessages = await db.prepare(`
      SELECT * FROM contact_messages
      WHERE email_status = 'failed' AND email_attempts < 3
      ORDER BY created_at ASC LIMIT 10
    `).all<ContactRecord>();

    const rows = failedMessages.results || [];
    const nowTs = Math.floor(Date.now() / 1000);

    for (const msg of rows) {
      const attempts = msg.email_attempts || 1;
      let delaySec = 120; // 2 minutes
      if (attempts === 2) delaySec = 600; // 10 minutes
      else if (attempts >= 3) delaySec = 1800; // 30 minutes

      // Check if enough time has elapsed since message creation or previous attempt
      const lastActionTs = msg.email_sent_at || msg.created_at || nowTs;
      if (nowTs - lastActionTs < delaySec) {
        continue; // Backoff time not reached yet
      }

      retried++;
      const res = await sendContactNotification(env, db, msg, siteUrl);
      if (res.ok) succeeded++;
      else failed++;
    }
  } catch (err: any) {
    console.error('[ContactNotify] Error in retryFailedContactNotifications:', err.message);
  }

  return { retried, succeeded, failed };
}
