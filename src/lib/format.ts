/** Small, dependency-light formatting & text helpers. */
import { marked } from 'marked';

const INR = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats whole rupees as "₹23.00", or "Free" when 0/null/undefined. */
export function formatINR(rupees: number | null | undefined): string {
  const n = Number(rupees);
  if (!n || n <= 0 || isNaN(n)) return 'Free';
  return String.fromCharCode(8377) + INR.format(n);
}

/** Parse legacy Unix seconds, millisecond epochs, or ISO date strings. */
export function parseDate(val: number | string | Date | null | undefined): Date | null {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    if (val <= 0) return null;
    const ms = val < 1e12 ? val * 1000 : val;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return null;
    if (/^\d+$/.test(s)) {
      const num = Number(s);
      if (num <= 0) return null;
      const ms = num < 1e12 ? num * 1000 : num;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Formats a timestamp in Asia/Kolkata timezone as "14 Oct 2026, 11:14 PM". */
export function formatDateTime(val: number | string | Date | null | undefined): string {
  const d = parseDate(val);
  if (!d) return '—';
  const raw = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
  return raw.replace(/am|pm/i, (m) => m.toUpperCase());
}

/** Short date format in Asia/Kolkata: "14 Oct 2026". */
export function formatDate(val: number | string | Date | null | undefined): string {
  const d = parseDate(val);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0 || isNaN(Number(bytes))) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = Number(bytes);
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function cleanFileName(label: string | null | undefined, fallback = 'File'): string {
  let s = (label || '').trim();
  if (!s) return fallback;
  s = s.replace(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[-_]/, '');
  s = s.replace(/^\d{10,}[-_]/, '');
  s = s.replace(/\s*\(\d+\)(?=\.[a-zA-Z0-9]+$|$)/, '');
  return s.trim() || fallback;
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
