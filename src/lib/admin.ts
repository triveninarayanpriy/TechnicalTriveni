/** Shared helpers for admin API endpoints. */
import type { AstroCookies } from 'astro';
import { verifyCsrf } from './auth';

/** 303 redirect (POST → GET) with an optional flash message. */
export function flashRedirect(to: string, opts: { ok?: string; err?: string } = {}): Response {
  const url = new URL(to, 'http://x'); // base is ignored; we only keep path+search
  if (opts.ok) url.searchParams.set('ok', opts.ok);
  if (opts.err) url.searchParams.set('err', opts.err);
  const location = url.pathname + (url.search || '');
  return new Response(null, { status: 303, headers: { Location: location } });
}

/** Validate the CSRF token from a submitted form. */
export function csrfOk(cookies: AstroCookies, form: FormData): boolean {
  return verifyCsrf(cookies, String(form.get('csrf') || ''));
}

/** Parse a checkbox value ("on"/"1"/"true") to 0/1. */
export function checkbox(form: FormData, name: string): number {
  const v = String(form.get(name) || '').toLowerCase();
  return v === 'on' || v === '1' || v === 'true' ? 1 : 0;
}

/** Parse an integer field with a fallback. */
export function intField(form: FormData, name: string, fallback = 0): number {
  const n = parseInt(String(form.get(name) ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Trim + cap a string field. */
export function strField(form: FormData, name: string, max = 5000): string {
  return String(form.get(name) ?? '').trim().slice(0, max);
}
