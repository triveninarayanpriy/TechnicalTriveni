import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { resetPageToDefault } from '../../../../lib/pages';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { slugify } from '../../../../lib/format';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isJson = request.headers.get('accept')?.includes('application/json');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Invalid form data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Invalid form submission.' });
  }

  if (!csrfOk(cookies, form)) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Session expired, please refresh.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Session expired, try again.' });
  }

  const slugRaw = strField(form, 'slug', 80);
  if (!slugRaw) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Slug is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Slug is required.' });
  }

  const slug = slugify(slugRaw);

  try {
    await resetPageToDefault(env.DB, slug);

    if (isJson) {
      return new Response(JSON.stringify({
        ok: true,
        msg: 'Page reset to built-in site default.',
        slug,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return flashRedirect(`/admin/pages/${slug}`, { ok: 'Page reset to built-in site default.' });
  } catch (err: any) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect(`/admin/pages/${slug}`, { err: err.message });
  }
};
