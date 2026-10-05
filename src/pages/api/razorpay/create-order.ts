import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getProjectById, createOrder, setOrderRazorpayId, getOrdersByEmail, getSetting } from '../../../lib/db';
import { razorpayConfigured, createRazorpayOrder } from '../../../lib/razorpay';
import { rateLimit, clientIp } from '../../../lib/auth';
import { sendEmail, buildOrderEmail } from '../../../lib/email';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: APIRoute = async ({ request }) => {
  if (!razorpayConfigured(env)) {
    return json({ error: 'Payments are not enabled yet.' }, 400);
  }

  // Basic abuse protection
  const rl = await rateLimit(env, `order:${clientIp(request)}`, 12, 60);
  if (!rl.ok) return json({ error: 'Too many attempts. Please wait a minute.' }, 429);

  let body: { projectId?: number; email?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const projectId = Number(body.projectId);
  const email = (body.email || '').trim().toLowerCase();
  const couponCode = (body.couponCode || '').trim().toUpperCase();
  if (!projectId || !EMAIL_RE.test(email) || email.length > 200) {
    return json({ error: 'A valid email and project are required.' }, 400);
  }

  const project = await getProjectById(env.DB, projectId);
  if (!project || project.published !== 1 || project.combo_enabled !== 1 || project.price_inr <= 0) {
    return json({ error: 'This project is not available for purchase.' }, 404);
  }

  // Check if they already own it
  const pastOrders = await getOrdersByEmail(env.DB, email);
  const existing = pastOrders.find(o => o.project_id === project.id);
  if (existing && existing.download_token) {
    const base = env.SITE_URL || new URL(request.url).origin;
    const url = new URL(`/account/download?order=${existing.id}&token=${existing.download_token}`, base).toString();
    
    try {
      const { subject, html } = buildOrderEmail(existing, url);
      await sendEmail(env, { to: email, subject, html });
    } catch { /* ignore */ }
    
    return json({ 
      alreadyPaid: true, 
      message: 'You already own this project! We just sent the download link to your email again.' 
    });
  }

  // Amount is ALWAYS derived server-side from the database.
  const amountInr = project.price_inr;
  const orderId = crypto.randomUUID();

  // Auto-detect test mode
  let is_test = 0;
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
    is_test = 1;
  } else {
    const testEmails = (await getSetting(env.DB, 'test_emails') || '').toLowerCase().split(',').map((e: string) => e.trim());
    if (testEmails.includes(email)) is_test = 1;
  }

  await createOrder(env.DB, {
    id: orderId,
    project_id: project.id,
    project_title: project.title,
    email,
    amount_inr: amountInr,
    is_test,
  });

  try {
    const rzp = await createRazorpayOrder(env, amountInr, orderId, {
      projectId: String(project.id),
      slug: project.slug,
    });
    await setOrderRazorpayId(env.DB, orderId, rzp.id);

    return json({
      orderId,
      razorpayOrderId: rzp.id,
      amount: rzp.amount, // paise
      keyId: env.RAZORPAY_KEY_ID,
      projectTitle: project.title,
    });
  } catch (e) {
    return json({ error: 'Could not start checkout. Please try again.' }, 502);
  }
};
