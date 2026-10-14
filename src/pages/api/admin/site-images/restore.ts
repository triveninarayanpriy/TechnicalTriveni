import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk } from '../../../../lib/admin';
import { restoreSiteAssetsRevision } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    let revisionId = 0;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      if (!csrfOk(cookies, null, request)) {
        return new Response(JSON.stringify({ ok: false, err: 'Session expired or invalid CSRF token.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const data = await request.json();
      revisionId = parseInt(String(data.revision_id || 0), 10);
    } else {
      const form = await request.formData();
      if (!csrfOk(cookies, form, request)) {
        return new Response(JSON.stringify({ ok: false, err: 'Session expired or invalid CSRF token.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      revisionId = parseInt(String(form.get('revision_id') || 0), 10);
    }

    if (!revisionId) {
      return new Response(JSON.stringify({ ok: false, err: 'Missing revision ID.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const restoredConfig = await restoreSiteAssetsRevision(env.DB, revisionId);
    if (!restoredConfig) {
      return new Response(JSON.stringify({ ok: false, err: 'Revision not found or could not be parsed.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, config: restoredConfig, message: `Restored revision #${revisionId}.` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error restoring site assets revision:', err);
    return new Response(
      JSON.stringify({ ok: false, err: err?.message || 'Failed to restore revision.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
