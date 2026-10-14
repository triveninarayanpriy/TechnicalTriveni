import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { hasProjectSnapshot } from '../../../../lib/project-snapshot';

export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const projectId = Number(url.searchParams.get('project_id') || 0);

  if (!projectId || projectId <= 0) {
    return new Response(JSON.stringify({ ok: true, has_snapshot: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const status = await hasProjectSnapshot(env.DB, projectId);
  return new Response(JSON.stringify({
    ok: true,
    has_snapshot: status.has_snapshot,
    created_at: status.created_at
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
