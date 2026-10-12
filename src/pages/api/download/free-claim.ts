import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getProjectById } from '../../../lib/db';
import { randomToken } from '../../../lib/crypto';
import { sendEmail, buildOrderEmail } from '../../../lib/email';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  let body: { projectId?: number | string; email?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request payload.' }, 400);
  }

  const projectId = Number(body.projectId);
  const email = (body.email || '').trim().toLowerCase();

  if (!projectId || !email || !email.includes('@')) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const project = await getProjectById(env.DB, projectId);
  if (!project) {
    return json({ error: 'Project not found.' }, 404);
  }

  if (project.price_inr > 0) {
    return json({ error: 'This project requires payment.' }, 400);
  }

  // Idempotent: check if user already has an active order for this free project
  const existing = await env.DB.prepare(
    'SELECT * FROM orders WHERE project_id = ? AND email = ? AND status = "paid" ORDER BY created_at DESC LIMIT 1'
  ).bind(projectId, email).first<{ id: string; download_token: string }>();

  let orderId: string;
  let token: string;

  if (existing?.download_token) {
    orderId = existing.id;
    token = existing.download_token;
  } else {
    orderId = `free_${randomToken(12)}`;
    token = randomToken(32);
    const now = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
      `INSERT INTO orders (id, project_id, project_title, email, amount_inr, status, download_token, paid_at, created_at)
       VALUES (?, ?, ?, ?, 0, 'paid', ?, ?, ?)`
    ).bind(orderId, project.id, project.title, email, token, now, now).run();
  }

  const relative = `/account/download?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`;
  const base = env.SITE_URL || new URL(request.url).origin;
  const fullDownloadUrl = new URL(relative, base).toString();

  // Best-effort delivery email
  try {
    const paidOrder = {
      id: orderId,
      project_id: project.id,
      project_title: project.title,
      email,
      amount_inr: 0,
      status: 'paid',
      download_token: token,
      created_at: Math.floor(Date.now() / 1000),
    };
    const { subject, html } = buildOrderEmail(paidOrder, fullDownloadUrl);
    await sendEmail(env, { to: email, subject, html });
  } catch (err) {
    console.error('Free claim email error:', err);
  }

  return json({
    success: true,
    redirect: relative,
    message: 'Free download ready. Link also sent to your email.',
  });
};
