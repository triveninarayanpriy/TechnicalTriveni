import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk } from '../../../../lib/admin';

const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const form = await request.formData();

    if (!csrfOk(cookies, form, request)) {
      return new Response(JSON.stringify({ ok: false, err: 'Session expired or invalid CSRF token.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const file = form.get('file');
    if (!file || !(file instanceof File) || file.size === 0) {
      return new Response(JSON.stringify({ ok: false, err: 'No image file provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return new Response(JSON.stringify({ ok: false, err: 'File exceeds 5 MB limit. Please compress or choose a smaller image.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.has(ext) && !ALLOWED_TYPES.has(file.type)) {
      return new Response(
        JSON.stringify({ ok: false, err: 'Invalid image format. Only JPG, PNG, WebP, and AVIF are accepted.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawSlot = String(form.get('slot') || 'site_image').replace(/[^a-zA-Z0-9_-]/g, '_');
    const width = parseInt(String(form.get('width') || '0'), 10) || undefined;
    const height = parseInt(String(form.get('height') || '0'), 10) || undefined;

    // Upload main file to KV
    const primaryUpload = await uploadToStore(env.BLOBS, file, `site-assets/${rawSlot}`);
    const primaryUrl = `/media/${primaryUpload.key}`;

    // Upload any responsive variants provided
    const variants: Record<string, string> = {};
    const variantSizes = ['320', '640', '960', '1600'];
    for (const sz of variantSizes) {
      const vFile = form.get(`variant_${sz}`);
      if (vFile instanceof File && vFile.size > 0) {
        try {
          const vUp = await uploadToStore(env.BLOBS, vFile, `site-assets/${rawSlot}/v${sz}`);
          variants[sz] = `/media/${vUp.key}`;
        } catch (e) {
          console.warn(`Failed to upload variant ${sz}:`, e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        url: primaryUrl,
        filename: primaryUpload.filename,
        width: width,
        height: height,
        size_bytes: primaryUpload.size,
        variants,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Site image upload failed:', err);
    return new Response(
      JSON.stringify({ ok: false, err: err?.message || 'Upload failed unexpectedly.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
