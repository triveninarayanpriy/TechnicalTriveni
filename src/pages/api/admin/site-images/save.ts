import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk } from '../../../../lib/admin';
import { saveSiteAssetsConfig, type SiteAssetsConfig } from '../../../../lib/db';
import { validateSocialUrl } from '../../../../lib/site-assets';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    let payload: any = null;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      if (!csrfOk(cookies, null, request)) {
        return new Response(JSON.stringify({ ok: false, err: 'Session expired or invalid CSRF token.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      payload = await request.json();
    } else {
      const form = await request.formData();
      if (!csrfOk(cookies, form, request)) {
        return new Response(JSON.stringify({ ok: false, err: 'Session expired or invalid CSRF token.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const rawJson = form.get('config');
      if (rawJson) {
        payload = JSON.parse(String(rawJson));
      }
    }

    if (!payload || typeof payload !== 'object') {
      return new Response(JSON.stringify({ ok: false, err: 'Invalid configuration payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate social links
    const socials = payload.social_links || {};
    const platforms: Array<'youtube' | 'instagram' | 'github' | 'linkedin'> = ['youtube', 'instagram', 'github', 'linkedin'];
    for (const p of platforms) {
      const val = socials[p];
      if (val && typeof val === 'string' && val.trim().length > 0) {
        const check = validateSocialUrl(p, val);
        if (!check.valid) {
          return new Response(
            JSON.stringify({ ok: false, err: `Invalid ${p} URL: ${check.error}` }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Validate alt text requirements
    if (payload.maker_photo?.url && !payload.maker_photo?.alt?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, err: 'Alt text is required for Maker Photo.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (payload.how_it_works_image?.url && !payload.how_it_works_image?.alt?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, err: 'Alt text is required for How It Works image.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (payload.channel_showcase?.images?.length && !payload.channel_showcase?.alt?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, err: 'Alt text is required for Channel Showcase.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (payload.default_share_image?.url && !payload.default_share_image?.alt?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, err: 'Alt text is required for Default Share Image.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize alt texts
    const sanitize = (s: any) => String(s || '').trim().slice(0, 300);
    const sanitizedConfig: SiteAssetsConfig = {
      maker_photo: {
        url: String(payload.maker_photo?.url || ''),
        alt: sanitize(payload.maker_photo?.alt),
        filename: sanitize(payload.maker_photo?.filename),
        width: Number(payload.maker_photo?.width) || 1200,
        height: Number(payload.maker_photo?.height) || 1500,
        size_bytes: Number(payload.maker_photo?.size_bytes) || 0,
        variants: payload.maker_photo?.variants || {},
      },
      how_it_works_image: {
        url: String(payload.how_it_works_image?.url || ''),
        alt: sanitize(payload.how_it_works_image?.alt),
        filename: sanitize(payload.how_it_works_image?.filename),
        width: Number(payload.how_it_works_image?.width) || 1400,
        height: Number(payload.how_it_works_image?.height) || 1000,
        size_bytes: Number(payload.how_it_works_image?.size_bytes) || 0,
        variants: payload.how_it_works_image?.variants || {},
      },
      channel_showcase: {
        images: Array.isArray(payload.channel_showcase?.images)
          ? payload.channel_showcase.images.slice(0, 3).map((img: any) => ({
              url: String(img.url || ''),
              alt: sanitize(img.alt),
              filename: sanitize(img.filename),
              width: Number(img.width) || 1600,
              height: Number(img.height) || 900,
              size_bytes: Number(img.size_bytes) || 0,
              variants: img.variants || {},
            }))
          : [],
        alt: sanitize(payload.channel_showcase?.alt),
      },
      default_share_image: {
        url: String(payload.default_share_image?.url || ''),
        alt: sanitize(payload.default_share_image?.alt),
        filename: sanitize(payload.default_share_image?.filename),
        width: Number(payload.default_share_image?.width) || 1200,
        height: Number(payload.default_share_image?.height) || 630,
        size_bytes: Number(payload.default_share_image?.size_bytes) || 0,
        variants: payload.default_share_image?.variants || {},
      },
      social_links: {
        youtube: String(socials.youtube || '').trim(),
        instagram: String(socials.instagram || '').trim(),
        github: String(socials.github || '').trim(),
        linkedin: String(socials.linkedin || '').trim(),
        show_icons: socials.show_icons !== false,
      },
    };

    const note = sanitize(payload.note) || 'Updated site images and links';
    const revisionId = await saveSiteAssetsConfig(env.DB, sanitizedConfig, note);

    return new Response(
      JSON.stringify({ ok: true, revision_id: revisionId, message: 'Settings saved successfully.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error saving site images config:', err);
    return new Response(
      JSON.stringify({ ok: false, err: err?.message || 'Failed to save configuration.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
