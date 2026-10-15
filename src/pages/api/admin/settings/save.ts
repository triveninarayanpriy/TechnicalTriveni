import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { setSetting } from '../../../../lib/db';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';

import { validateAmazonTag } from '../../../../lib/affiliate';

const ALLOWED = [
  'site_announcement',
  'contact_email',
  'announcement_link',
  'announcement_expiry',
  'test_emails',
  'announcement_enabled',
  'gemini_model',
  'site_title',
  'social_youtube',
  'social_instagram',
  'contact_notification_email',
  'contact_email_notify_enabled',
  'contact_autoack_enabled',
  'affiliate_amazon_tag',
  'affiliate_amazon_domain',
  'affiliate_disclosure_text',
  'affiliate_show_disclosure',
  'affiliate_custom_stores',
  'affiliate_creators_credentials',
];

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return flashRedirect('/admin/settings', { err: 'Session expired.' });

  // Handle checkboxes (unchecked checkboxes are omitted from formData)
  await setSetting(env.DB, 'announcement_enabled', form.get('announcement_enabled') === '1' ? '1' : '0');
  await setSetting(env.DB, 'contact_email_notify_enabled', form.get('contact_email_notify_enabled') === '1' ? '1' : '0');
  await setSetting(env.DB, 'contact_autoack_enabled', form.get('contact_autoack_enabled') === '1' ? '1' : '0');
  if (form.has('affiliate_show_disclosure') || form.has('affiliate_amazon_tag')) {
    await setSetting(env.DB, 'affiliate_show_disclosure', form.get('affiliate_show_disclosure') === '1' ? '1' : '0');
  }

  // Validate Amazon Affiliate Tracking Tag if provided
  if (form.has('affiliate_amazon_tag')) {
    const rawTag = strField(form, 'affiliate_amazon_tag', 60).toLowerCase();
    if (rawTag && !validateAmazonTag(rawTag)) {
      return flashRedirect('/admin/settings/affiliate', {
        err: 'Invalid Amazon India tracking ID. Must contain only lowercase letters, digits, hyphens, and end in -21 (e.g. techtriveni-21).'
      });
    }
  }

  if (form.has('gemini_api_key')) {
    const keyVal = strField(form, 'gemini_api_key', 200);
    if (keyVal && !keyVal.includes('•••')) {
      await setSetting(env.DB, 'gemini_api_key', keyVal);
    }
  }

  for (const key of ALLOWED) {
    if (
      key === 'announcement_enabled' ||
      key === 'contact_email_notify_enabled' ||
      key === 'contact_autoack_enabled' ||
      key === 'affiliate_show_disclosure'
    ) continue;
    if (form.has(key)) {
      await setSetting(env.DB, key, strField(form, key, 2000));
    }
  }

  const referrer = request.headers.get('referer') || '';
  const redirectTo = referrer.includes('/affiliate') ? '/admin/settings/affiliate' : '/admin/settings';
  return flashRedirect(redirectTo, { ok: 'Settings saved successfully.' });
};
