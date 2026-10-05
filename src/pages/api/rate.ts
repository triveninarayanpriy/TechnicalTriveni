import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  const rating = parseInt(url.searchParams.get('rating') || '0', 10);
  // Ideally there is a secure token or hash here to prevent abuse,
  // but for the MVP proof-of-concept, we just update the order if it exists.
  const token = url.searchParams.get('token'); 

  if (!orderId || !rating || rating < 1 || rating > 5) {
    return new Response('Invalid request', { status: 400 });
  }

  try {
    // Optionally verify token if implemented, e.g. token === hash(orderId + secret)
    
    // Update the rating
    const db = env.DB;
    const res = await db.prepare('UPDATE orders SET rating = ? WHERE id = ?').bind(rating, parseInt(orderId, 10)).run();
    
    if (res.meta.changes === 0) {
      return new Response('Order not found', { status: 404 });
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rating Submitted</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 4rem 1rem; color: #151314; }
          .icon { color: #10b981; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <h1>Thank You!</h1>
        <p>Your rating of ${rating} stars has been recorded.</p>
        <a href="/" style="display: inline-block; margin-top: 1rem; color: #E92424; text-decoration: none; font-weight: 600;">Return to homepage</a>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    return new Response('Internal error: ' + err.message, { status: 500 });
  }
};
