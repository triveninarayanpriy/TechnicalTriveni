import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { csrfOk, flashRedirect } from '../../../lib/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  if (!csrfOk(cookies, form)) return new Response('Unauthorized', { status: 401 });

  // Get all data
  const [projects, components, orders, messages, pages] = await Promise.all([
    env.DB.prepare('SELECT * FROM projects').all(),
    env.DB.prepare('SELECT * FROM components').all(),
    env.DB.prepare('SELECT * FROM orders').all(),
    env.DB.prepare('SELECT * FROM contact_messages').all(),
    env.DB.prepare('SELECT * FROM pages').all(),
  ]);

  const exportData = {
    generated_at: new Date().toISOString(),
    projects: projects.results,
    components: components.results,
    orders: orders.results,
    messages: messages.results,
    pages: pages.results,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="triveni_export_${new Date().toISOString().split('T')[0]}.json"`
    }
  });
};
