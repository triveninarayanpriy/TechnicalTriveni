import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { getSession, ensureCsrfToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, locals, cookies } = context;

  // Enforce www canonical host
  const host = url.hostname;
  if (host === 'technicaltriveni.me' || host === 'technicaltriveni.com') {
    const canonicalUrl = new URL(url);
    canonicalUrl.hostname = 'www.' + host;
    return context.redirect(canonicalUrl.toString(), 301);
  }

  // DB Redirects
  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_')) {
    try {
      const db = (context.locals as any).db || (env as any).DB;
      if (db) {
        const row = await db.prepare('SELECT new_path FROM redirects WHERE old_path = ?').bind(url.pathname).first();
        if (row && row.new_path) {
          return context.redirect(row.new_path, 301);
        }
      }
    } catch {
      // ignore db errors in middleware
    }
  }

  // --- session + csrf ---
  locals.admin = await getSession(env, cookies);
  locals.csrfToken = ensureCsrfToken(cookies);

  // --- route guards ---
  const path = url.pathname;
  const isAdminPage = path === '/admin' || path.startsWith('/admin/');
  const isAdminApi = path.startsWith('/api/admin/');
  const isLogin = path === '/admin/login' || path === '/api/admin/login';

  if (isAdminPage) {
    locals.noindex = true;
  }

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

  // --- security headers (CSP is handled by Astro's security.csp) ---
  applySecurityHeaders(response, url.protocol === 'https:', locals.noindex);
  return response;
});

function applySecurityHeaders(res: Response, isHttps: boolean, noindex?: boolean) {
  const h = res.headers;
  if (noindex) h.set('X-Robots-Tag', 'noindex, nofollow');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('X-Frame-Options', 'DENY');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (isHttps) {
    h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}
