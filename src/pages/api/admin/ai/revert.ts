import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { revertProjectSnapshot } from '../../../../lib/project-snapshot';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED', message: 'Admin authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST', message: 'Invalid payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const projectId = Number(body.project_id || 0);
  if (!projectId || projectId <= 0) {
    return new Response(JSON.stringify({ ok: false, error: 'INVALID_ID', message: 'Valid project ID required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await revertProjectSnapshot(env.DB, projectId);
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, error: 'REVERT_FAILED', message: res.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ok: true, message: res.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'SERVER_ERROR',
      message: err?.message || 'Failed to revert project snapshot.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
