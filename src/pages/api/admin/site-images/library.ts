import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { listProjects } from '../../../../lib/db';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Fetch all project covers
    const projects = await listProjects(env.DB, {});
    const covers = projects
      .filter((p) => p.cover_image && p.cover_image.trim())
      .map((p) => ({
        url: p.cover_image,
        title: p.title,
        filename: (p.cover_image.split('/').pop() || '').slice(0, 50),
        width: 1600,
        height: 900,
      }));

    // Fetch uploaded media from project_images
    const mediaRes = await env.DB.prepare(
      'SELECT id, project_id, url, caption, kind FROM project_images ORDER BY id DESC LIMIT 50'
    ).all<{ id: number; project_id: number; url: string; caption?: string; kind: string }>();

    const media = (mediaRes.results || []).map((m) => ({
      url: m.url,
      title: m.caption || `Image #${m.id}`,
      filename: (m.url.split('/').pop() || '').slice(0, 50),
      kind: m.kind,
    }));

    return new Response(JSON.stringify({ ok: true, covers, media }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error fetching media library:', err);
    return new Response(
      JSON.stringify({ ok: false, err: err?.message || 'Failed to fetch library' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
