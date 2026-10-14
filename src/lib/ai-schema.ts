export interface AIDraftOutput {
  title: string;
  slug: string;
  summary: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  build_time: string;
  tags: string[];
  description_markdown: string;
  outcomes: string[];
  prerequisites: string[];
  not_included: string[];
  faq: Array<{ q: string; a: string }>;
  safety_note_markdown: string;
  credits_markdown: string;
  seo: {
    meta_title: string;
    meta_description: string;
  };
  steps: Array<{
    title: string;
    instruction_markdown: string;
    why_or_gotcha: string;
  }>;
  wiring: Array<{
    from: string;
    to: string;
    note: string;
    module?: string;
  }>;
  troubleshooting: Array<{
    symptom: string;
    fix_markdown: string;
  }>;
  resource_links: Array<{
    label: string;
    url: string;
    type: string;
  }>;
  bom: Array<{
    name: string;
    qty: number | string;
    role: string;
    approx_price_inr: number;
    buy_url?: string;
  }>;
  needs_review: Array<{
    field: string;
    reason: string;
  }>;
}

/**
 * Sanitizes markdown or plain text to prevent script injection
 */
export function sanitizeText(text: any): string {
  if (text === null || text === undefined) return '';
  const s = String(text);
  return s
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:[^"'\s]*/gi, '');
}

/**
 * Sanitizes a URL: must begin with http://, https://, or /
 */
export function sanitizeUrl(url: any): string {
  if (!url) return '';
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) {
    return s.replace(/["'<>]/g, '');
  }
  return '';
}

/**
 * Normalizes difficulty to 'Beginner' | 'Intermediate' | 'Advanced'
 */
function normalizeDifficulty(diff: any): 'Beginner' | 'Intermediate' | 'Advanced' {
  const d = String(diff || '').toLowerCase();
  if (d.includes('adv')) return 'Advanced';
  if (d.includes('inter')) return 'Intermediate';
  return 'Beginner';
}

/**
 * Validates and repairs the draft output returned from Gemini.
 * Never throws on salvageable field errors; clamps lengths and ensures schema integrity.
 */
export function validateOrRepairDraftOutput(raw: any): AIDraftOutput {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid AI response: Expected a JSON object.');
  }

  // 1. Title & Slug
  const rawTitle = sanitizeText(raw.title || '').trim();
  const title = rawTitle || 'Untitled Project';

  let slug = sanitizeText(raw.slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (!slug) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // 2. Summary (max 160 chars)
  let summary = sanitizeText(raw.summary || '').trim();
  if (summary.length > 160) {
    summary = summary.substring(0, 157).trim() + '...';
  }

  // 3. Category, Difficulty, Build time
  const category = sanitizeText(raw.category || 'Electronics').trim();
  const difficulty = normalizeDifficulty(raw.difficulty);
  const build_time = sanitizeText(raw.build_time || '2-3 hours').trim();

  // 4. Tags
  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags.map((t: any) => sanitizeText(t).trim()).filter(Boolean);
  } else if (typeof raw.tags === 'string' && raw.tags.trim()) {
    tags = raw.tags.split(',').map(t => sanitizeText(t).trim()).filter(Boolean);
  }

  // 5. Description markdown
  const description_markdown = sanitizeText(raw.description_markdown || raw.description || '').trim();

  // 6. Outcomes, Prerequisites, Not included
  const outcomes = Array.isArray(raw.outcomes)
    ? raw.outcomes.map((o: any) => sanitizeText(o).trim()).filter(Boolean)
    : [];
  const prerequisites = Array.isArray(raw.prerequisites)
    ? raw.prerequisites.map((p: any) => sanitizeText(p).trim()).filter(Boolean)
    : [];
  const not_included = Array.isArray(raw.not_included)
    ? raw.not_included.map((n: any) => sanitizeText(n).trim()).filter(Boolean)
    : [];

  // 7. FAQ [{q, a}]
  const faq: Array<{ q: string; a: string }> = [];
  if (Array.isArray(raw.faq)) {
    for (const item of raw.faq) {
      if (item && (item.q || item.question)) {
        faq.push({
          q: sanitizeText(item.q || item.question).trim(),
          a: sanitizeText(item.a || item.answer).trim()
        });
      }
    }
  }

  // 8. Safety & Credits
  const safety_note_markdown = sanitizeText(raw.safety_note_markdown || raw.safety_note || '').trim();
  const credits_markdown = sanitizeText(raw.credits_markdown || raw.credits || '').trim();

  // 9. SEO
  const rawSeo = raw.seo || {};
  let meta_title = sanitizeText(rawSeo.meta_title || title).trim();
  if (meta_title.length > 60) {
    meta_title = meta_title.substring(0, 57).trim() + '...';
  }

  let meta_description = sanitizeText(rawSeo.meta_description || summary).trim();
  if (meta_description.length > 160) {
    meta_description = meta_description.substring(0, 157).trim() + '...';
  }

  const seo = {
    meta_title,
    meta_description
  };

  // 10. Steps [{title, instruction_markdown, why_or_gotcha}]
  const steps: Array<{ title: string; instruction_markdown: string; why_or_gotcha: string }> = [];
  if (Array.isArray(raw.steps)) {
    for (const step of raw.steps) {
      if (step && (step.title || step.instruction_markdown || step.body || step.instruction)) {
        steps.push({
          title: sanitizeText(step.title || 'Step').trim(),
          instruction_markdown: sanitizeText(step.instruction_markdown || step.body || step.instruction || '').trim(),
          why_or_gotcha: sanitizeText(step.why_or_gotcha || step.why || '').trim()
        });
      }
    }
  }

  // 11. Wiring [{from, to, note, module}]
  const wiring: Array<{ from: string; to: string; note: string; module?: string }> = [];
  if (Array.isArray(raw.wiring)) {
    for (const wire of raw.wiring) {
      if (wire && (wire.from || wire.to || wire.from_pin || wire.to_pin)) {
        wiring.push({
          from: sanitizeText(wire.from || wire.from_pin || '').trim(),
          to: sanitizeText(wire.to || wire.to_pin || '').trim(),
          note: sanitizeText(wire.note || '').trim(),
          module: sanitizeText(wire.module || '').trim() || undefined
        });
      }
    }
  }

  // 12. Troubleshooting [{symptom, fix_markdown}]
  const troubleshooting: Array<{ symptom: string; fix_markdown: string }> = [];
  if (Array.isArray(raw.troubleshooting)) {
    for (const tb of raw.troubleshooting) {
      if (tb && (tb.symptom || tb.fix || tb.fix_markdown)) {
        troubleshooting.push({
          symptom: sanitizeText(tb.symptom || 'Issue encountered').trim(),
          fix_markdown: sanitizeText(tb.fix_markdown || tb.fix || tb.cause || '').trim()
        });
      }
    }
  }

  // 13. Resource links [{label, url, type}]
  const resource_links: Array<{ label: string; url: string; type: string }> = [];
  if (Array.isArray(raw.resource_links)) {
    for (const link of raw.resource_links) {
      if (link && link.label && link.url) {
        resource_links.push({
          label: sanitizeText(link.label).trim(),
          url: sanitizeUrl(link.url),
          type: sanitizeText(link.type || 'other').trim()
        });
      }
    }
  }

  // 14. BOM [{name, qty, role, approx_price_inr, buy_url}]
  const bom: Array<{ name: string; qty: number | string; role: string; approx_price_inr: number; buy_url?: string }> = [];
  if (Array.isArray(raw.bom)) {
    for (const b of raw.bom) {
      if (b && b.name) {
        const p = Number(b.approx_price_inr || b.unit_price_inr || 0);
        bom.push({
          name: sanitizeText(b.name).trim(),
          qty: b.qty !== undefined && b.qty !== null ? String(b.qty).trim() : '1',
          role: sanitizeText(b.role || b.notes || '').trim(),
          approx_price_inr: !isNaN(p) && p >= 0 ? Math.round(p) : 0,
          buy_url: b.buy_url ? sanitizeUrl(b.buy_url) : undefined
        });
      }
    }
  }

  // 15. Needs review [{field, reason}]
  const needs_review: Array<{ field: string; reason: string }> = [];
  if (Array.isArray(raw.needs_review)) {
    for (const nr of raw.needs_review) {
      if (nr && (nr.field || nr.reason)) {
        needs_review.push({
          field: sanitizeText(nr.field || 'General').trim(),
          reason: sanitizeText(nr.reason || '').trim()
        });
      }
    }
  }

  return {
    title,
    slug,
    summary,
    category,
    difficulty,
    build_time,
    tags,
    description_markdown,
    outcomes,
    prerequisites,
    not_included,
    faq,
    safety_note_markdown,
    credits_markdown,
    seo,
    steps,
    wiring,
    troubleshooting,
    resource_links,
    bom,
    needs_review
  };
}
