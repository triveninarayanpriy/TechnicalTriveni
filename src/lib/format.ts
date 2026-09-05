/** Small, dependency-light formatting & text helpers. */
import { marked } from 'marked';

const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹1,499 — whole rupees (no paise). */
export function formatINR(rupees: number): string {
  return `₹${INR.format(Math.round(rupees || 0))}`;
}

export function formatDate(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function truncate(s: string, n: number): string {
  if (!s) return '';
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

/** Split a comma-separated tags string into a clean array. */
export function parseTags(tags: string): string[] {
  return (tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

marked.setOptions({ gfm: true, breaks: true });

/** Render admin-authored Markdown to HTML (author is trusted). */
export function renderMarkdown(md: string): string {
  if (!md) return '';
  return marked.parse(md, { async: false }) as string;
}

/** difficulty → css modifier class */
export function difficultyClass(d: string): string {
  const key = (d || '').toLowerCase();
  if (key.startsWith('beg')) return 'is-beginner';
  if (key.startsWith('int')) return 'is-intermediate';
  if (key.startsWith('adv')) return 'is-advanced';
  return '';
}

/** Extract a YouTube video id from common URL shapes. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
