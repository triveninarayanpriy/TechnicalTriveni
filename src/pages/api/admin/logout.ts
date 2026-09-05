import type { APIRoute } from 'astro';
import { endSession } from '../../../lib/auth';
import { csrfOk } from '../../../lib/admin';

export const POST: APIRoute = async ({ cookies, request }) => {
  const form = await request.formData().catch(() => new FormData());
  // CSRF check (defence in depth; logout is low-risk but keep it consistent).
  if (!csrfOk(cookies, form)) return new Response(null, { status: 303, headers: { Location: '/admin' } });
  endSession(cookies);
  return new Response(null, { status: 303, headers: { Location: '/admin/login' } });
};
