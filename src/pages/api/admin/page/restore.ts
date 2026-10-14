import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getPageRevisionById, upsertPage, recordPageRevision } from '../../../../lib/db';
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

  const idRaw = form.get('id');
  const revisionId = idRaw ? parseInt(String(idRaw), 10) : NaN;
  if (!revisionId || isNaN(revisionId)) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Revision ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Revision ID is required.' });
  }

  try {
    const revision = await getPageRevisionById(env.DB, revisionId);
    if (!revision) {
      if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Revision not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      return flashRedirect('/admin/pages', { err: 'Revision not found.' });
    }

    await upsertPage(env.DB, {
      slug: revision.page_slug,
      title: revision.title,
      content_md: revision.content_md,
      meta_title: revision.meta_title || '',
      meta_description: revision.meta_description || '',
      is_custom: 1,
      published: 1,
    });

    await recordPageRevision(env.DB, {
      page_slug: revision.page_slug,
      title: revision.title,
      content_md: revision.content_md,
      meta_title: revision.meta_title,
      meta_description: revision.meta_description,
      source: 'restore',
      note: `Restored revision #${revision.id}`,
    });

    const msg = `Restored version from ${new Date(revision.created_at * 1000).toLocaleDateString('en-GB')}.`;

    if (isJson) {
      return new Response(JSON.stringify({
        ok: true,
        msg,
        slug: revision.page_slug,
        title: revision.title,
        content_md: revision.content_md,
        meta_title: revision.meta_title,
        meta_description: revision.meta_description,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return flashRedirect(`/admin/pages/${revision.page_slug}`, { ok: msg });
  } catch (err: any) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: err.message });
  }
};
