import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { importAllBuiltinPages } from '../../../../lib/pages';
import { csrfOk, flashRedirect } from '../../../../lib/admin';

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

  try {
    const { imported, skipped } = await importAllBuiltinPages(env.DB);
    const msg = `Successfully imported ${imported} page${imported === 1 ? '' : 's'} (${skipped} skipped - already custom).`;

    if (isJson) {
      return new Response(JSON.stringify({
        ok: true,
        msg,
        imported,
        skipped,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return flashRedirect('/admin/pages', { ok: msg });
  } catch (err: any) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: err.message });
  }
};
