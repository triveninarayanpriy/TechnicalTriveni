import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { getSession, ensureCsrfToken } from './lib/auth';
import { randomToken } from './lib/crypto';

/**
 * Runs on every request. Responsibilities:
 *   1. Resolve the admin session + CSRF token into `locals`.
 *   2. Guard /admin and /api/admin routes.
 *   3. Attach a strict set of security headers (incl. a nonce-based CSP in prod).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, cookies, url } = context;

  // --- session + csrf ---
  locals.admin = await getSession(env, cookies);
  locals.csrfToken = ensureCsrfToken(cookies);
  locals.cspNonce = randomToken(16);

  // --- route guards ---
  const path = url.pathname;
  const isAdminPage = path === '/admin' || path.startsWith('/admin/');
  const isAdminApi = path.startsWith('/api/admin/');
  const isLogin = path === '/admin/login' || path === '/api/admin/login';

  if ((isAdminPage || isAdminApi) && !isLogin && !locals.admin) {
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    const nextPath = encodeURIComponent(path + url.search);
    return context.redirect(`/admin/login?next=${nextPath}`);
  }

  const response = await next();

  // --- security headers ---
  applySecurityHeaders(response, locals.cspNonce, url.protocol === 'https:');
  return response;
});

function applySecurityHeaders(res: Response, nonce: string, isHttps: boolean) {
  const h = res.headers;

  // Only add CSP to HTML documents (skip static assets / JSON APIs).
  const contentType = h.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const csp = import.meta.env.PROD
      ? [
          `default-src 'self'`,
          // Our own scripts are bundled to /_astro (self). Nonce covers JSON-LD.
          `script-src 'self' 'nonce-${nonce}' https://checkout.razorpay.com https://challenges.cloudflare.com`,
          // Astro injects scoped <style> tags inline; fonts.googleapis for the stylesheet.
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
          `font-src 'self' https://fonts.gstatic.com`,
          `img-src 'self' data: blob: https:`,
          `media-src 'self' https:`,
          `connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com`,
          `frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com`,
          `object-src 'none'`,
          `base-uri 'self'`,
          `form-action 'self'`,
          `frame-ancestors 'none'`,
          `upgrade-insecure-requests`,
        ].join('; ')
      : // Relaxed policy in dev so Vite HMR / inline dev scripts work.
        [
          `default-src 'self' 'unsafe-inline' 'unsafe-eval' https: ws: data: blob:`,
          `frame-src https: 'self'`,
        ].join('; ');
    h.set('Content-Security-Policy', csp);
  }

  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('X-Frame-Options', 'DENY');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (isHttps) {
    h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}
