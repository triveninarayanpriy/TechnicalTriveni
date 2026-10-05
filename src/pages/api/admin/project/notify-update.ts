import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getProjectById } from '../../../../lib/db';
import { sendEmail } from '../../../../lib/email';
import { randomToken } from '../../../../lib/crypto';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) return new Response('Unauthorized', { status: 401 });
  
  const form = await request.formData();
  const projectId = Number(form.get('id'));
  
  const project = await getProjectById(env.DB, projectId);
  if (!project) return new Response('Not found', { status: 404 });
  
  const orders = await env.DB.prepare('SELECT email, id, download_token FROM orders WHERE project_id = ? AND status = "paid" GROUP BY email').bind(projectId).all();
  
  if (!orders.results || orders.results.length === 0) {
    return new Response(JSON.stringify({ success: true, count: 0 }), { headers: { 'content-type': 'application/json' } });
  }
  
  let count = 0;
  for (const order of orders.results) {
    const relativeUrl = '/account/download?order=' + order.id + '&token=' + order.download_token;
    const fullUrl = new URL(relativeUrl, env.SITE_URL || new URL(request.url).origin).toString();
    
    const html = `
      <p>Hi there,</p>
      <p>Great news! An update has been released for <strong>${project.title}</strong> (Version ${project.version || 'latest'}).</p>
      <p>Changelog:</p>
      <blockquote>${project.changelog || 'Minor improvements and bug fixes.'}</blockquote>
      <p>You can download the latest files using your original access link:</p>
      <p><a href="${fullUrl}" style="display:inline-block;padding:10px 16px;background:#E92424;color:#fff;text-decoration:none;border-radius:4px;">Download Latest Version</a></p>
      <br/>
      <p>Happy building,</p>
      <p>Technical Triveni Team</p>
    `;
    
    await sendEmail(env, {
      to: String(order.email),
      subject: `Update available: ${project.title} (v${project.version || 'latest'})`,
      html
    });
    count++;
  }
  
  return new Response(JSON.stringify({ success: true, count }), { headers: { 'content-type': 'application/json' } });
};
