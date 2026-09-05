import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getFileById, getOrder } from '../../../../lib/db';
import { serveFromStore } from '../../../../lib/serve';
import { timingSafeEqual } from '../../../../lib/crypto';

/**
 * Download a paid combo file. Access is gated by a valid, paid order whose
 * download token matches — and the file must belong to that order's project.
 */
export const GET: APIRoute = async ({ params, url }) => {
  const fileId = Number(params.id);
  const orderId = url.searchParams.get('order') || '';
  const token = url.searchParams.get('token') || '';
  if (!fileId || !orderId || !token) return new Response('Missing parameters', { status: 400 });

  const order = await getOrder(env.DB, orderId);
  if (!order || order.status !== 'paid' || !order.download_token) {
    return new Response('Access denied', { status: 403 });
  }
  if (!timingSafeEqual(order.download_token, token)) {
    return new Response('Access denied', { status: 403 });
  }

  const file = await getFileById(env.DB, fileId);
  if (!file || file.project_id !== order.project_id || file.in_combo !== 1) {
    return new Response('Not found', { status: 404 });
  }

  return serveFromStore(env.BLOBS, file.r2_key, file.filename || file.label);
};
