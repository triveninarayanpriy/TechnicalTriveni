import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { markComponentLinkStatus } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  let componentId = 0;
  let partName = '';
  try {
    const json = await request.json();
    componentId = Number(json.component_id);
    partName = String(json.part_name || '').trim();
  } catch {
    const form = await request.formData();
    componentId = parseInt(String(form.get('component_id') || '0'), 10);
    partName = String(form.get('part_name') || '').trim();
  }

  if (!componentId && partName) {
    const comp = await env.DB.prepare('SELECT id FROM components WHERE name LIKE ?').bind(`%${partName}%`).first<{ id: number }>();
    if (comp) componentId = comp.id;
  }

  if (componentId) {
    await markComponentLinkStatus(env.DB, componentId, 'broken', 'user_report');
  }

  return new Response(JSON.stringify({
    ok: true,
    message: 'Thank you! The broken link has been reported and queued for verification.'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
