import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  cleanHeaderValue,
  formatDateTimeIST,
  buildContactNotificationEmail,
} from '../src/lib/email.ts';
import {
  DEFAULT_NOTIFICATION_EMAIL,
  getNotificationRecipients,
  isNotificationEnabled,
  isAutoAckEnabled,
} from '../src/lib/contact-notify.ts';

test('Email escaping and sanitization', () => {
  // HTML escaping
  const raw = '<script>alert("xss")</script> & "quotes" \'apostrophe\'';
  const escaped = escapeHtml(raw);
  assert.equal(escaped.includes('<script>'), false);
  assert.equal(escaped.includes('&lt;script&gt;'), true);
  assert.equal(escaped.includes('&quot;'), true);
  assert.equal(escaped.includes('&#39;'), true);

  // CRLF header injection cleaning
  const headerWithCrlf = 'John Doe\r\nBcc: victim@example.com\nSubject: Injected';
  const cleaned = cleanHeaderValue(headerWithCrlf);
  assert.equal(cleaned.includes('\r'), false);
  assert.equal(cleaned.includes('\n'), false);
  assert.equal(cleaned, 'John Doe Bcc: victim@example.com Subject: Injected');
});

test('IST Date formatting produces Asia/Kolkata with IST suffix', () => {
  const ts = 1791975000; // Unix seconds
  const formatted = formatDateTimeIST(ts);
  assert.match(formatted, /IST$/);
  assert.match(formatted, /\d{1,2} [A-Z][a-z]{2} \d{4}/);
});

test('buildContactNotificationEmail formats subject, replyTo, HTML and plain text', () => {
  const mail = buildContactNotificationEmail({
    messageId: 42,
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    subject: 'Question regarding ESP32 Drone project pinouts',
    message: 'Hello, I wanted to ask if GPIO 2 is pulled high on boot?\nThanks!',
    orderId: 'ord_drone_123',
    topic: 'support',
    sourcePage: '/contact',
    createdAt: 1791975000,
    siteUrl: 'https://www.technicaltriveni.me',
  });

  // Subject line requirement: "New message from <name>: <first 60 chars>"
  assert.equal(
    mail.subject,
    'New message from Aarav Sharma: Question regarding ESP32 Drone project pinouts'
  );

  // Reply-To set to visitor
  assert.deepEqual(mail.replyTo, {
    email: 'aarav@example.com',
    name: 'Aarav Sharma',
  });

  // HTML content checks
  assert.match(mail.html, /Aarav Sharma/);
  assert.match(mail.html, /aarav@example\.com/);
  assert.match(mail.html, /ord_drone_123/);
  assert.match(mail.html, /\/contact/);
  assert.match(mail.html, /IST/);
  assert.match(mail.html, /admin\/messages\?id=42/);

  // Plain text checks
  assert.match(mail.text, /New message from Aarav Sharma <aarav@example\.com>/);
  assert.match(mail.text, /Order ID: ord_drone_123/);
  assert.match(mail.text, /admin\/messages\?id=42/);
});

test('buildContactNotificationEmail safely escapes XSS in messages', () => {
  const malicious = buildContactNotificationEmail({
    messageId: 99,
    name: 'Hacker <img src=x onerror=alert(1)>',
    email: 'hack@example.com',
    subject: '<b onmouseover=evil()>Exploit</b>',
    message: '<script>document.cookie</script>',
    sourcePage: '<iframe src=evil.com>',
  });

  assert.equal(malicious.html.includes('<script>'), false);
  assert.equal(malicious.html.includes('<img src=x'), false);
  assert.equal(malicious.html.includes('&lt;script&gt;'), true);
  assert.equal(malicious.html.includes('&lt;iframe'), true);
});

test('Notification recipients and switch resolution', async () => {
  // Mock DB
  const mockDbWithSettings = (settingsMap) => ({
    prepare: (query) => ({
      bind: (...args) => ({
        first: async () => {
          const key = args[0];
          return settingsMap[key] ? { value: settingsMap[key] } : null;
        },
      }),
    }),
  });

  const env = { NOTIFICATION_EMAIL: 'fallback@example.com' };

  // Case 1: Custom comma-separated addresses in DB
  const db1 = mockDbWithSettings({
    contact_notification_email: 'admin1@test.com, admin2@test.com',
  });
  const recipients1 = await getNotificationRecipients(env, db1);
  assert.deepEqual(recipients1, ['admin1@test.com', 'admin2@test.com']);

  // Case 2: Empty DB setting falls back to env var
  const db2 = mockDbWithSettings({});
  const recipients2 = await getNotificationRecipients(env, db2);
  assert.deepEqual(recipients2, ['fallback@example.com']);

  // Case 3: Empty env var and DB falls back to default
  const db3 = mockDbWithSettings({});
  const recipients3 = await getNotificationRecipients({}, db3);
  assert.deepEqual(recipients3, [DEFAULT_NOTIFICATION_EMAIL]);

  // Case 4: Switch states
  const dbOn = mockDbWithSettings({ contact_email_notify_enabled: '1' });
  assert.equal(await isNotificationEnabled(dbOn), true);

  const dbOff = mockDbWithSettings({ contact_email_notify_enabled: '0' });
  assert.equal(await isNotificationEnabled(dbOff), false);

  const dbDefaultOn = mockDbWithSettings({});
  assert.equal(await isNotificationEnabled(dbDefaultOn), true);

  // Auto-ack defaults to false
  assert.equal(await isAutoAckEnabled(db3), false);
  const dbAutoAckOn = mockDbWithSettings({ contact_autoack_enabled: '1' });
  assert.equal(await isAutoAckEnabled(dbAutoAckOn), true);
});
