const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

const buyCssStart = c.indexOf('  .buy-card { padding: 1.5rem; }');
const factsStart = c.indexOf('  .facts {', buyCssStart);

const buyCss = c.substring(buyCssStart, factsStart);

const newCtaCss = \  /* CTA buy / free card */
  .cta-card { padding: 1.25rem; margin-top: 0.25rem; }
  .cta-card__row { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem; }
  .cta-card__kicker { font-size: var(--fs-xs); color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; }
  .cta-card__price { font-family: var(--font-display); font-weight: 700; font-size: 2rem; color: var(--text); display: flex; align-items: baseline; gap: 0.4rem; }
  .cta-card__price span { font-size: var(--fs-xs); color: var(--text-dim); font-weight: 500; }
  .cta-card__free { font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; color: var(--success); }
  .cta-card__desc { color: var(--text-muted); font-size: var(--fs-sm); margin-bottom: 1rem; }
  .cta-card__details { margin-bottom: 1.25rem; border: 1px solid var(--border); border-radius: var(--r-sm); }
  .cta-card__details summary { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; font-size: var(--fs-sm); font-weight: 600; cursor: pointer; list-style: none; background: var(--surface-2); }
  .cta-card__details summary::-webkit-details-marker { display: none; }
  .cta-card__details-body { padding: 0.8rem; border-top: 1px solid var(--border); background: var(--surface); }
  .cta-card__list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0; }
  .cta-card__list li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--fs-sm); color: var(--text); }
  .cta-card__list :global(svg) { color: var(--success); flex-shrink: 0; margin-top: 2px; }
  .cta-card__email { margin-bottom: 0; }
  .cta-card__secure { display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 0.75rem; font-size: var(--fs-xs); }
  .cta-card__retrieve { display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 0.4rem; font-size: var(--fs-xs); color: var(--text-muted); text-decoration: underline; }
  .cta-card__hint { display: block; margin-top: 0.4rem; font-size: var(--fs-xs); color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }
  .cta-card__note { margin-top: 0.85rem; padding: 0.7rem 0.85rem; background: rgba(231,36,42,0.08); border: 1px solid color-mix(in srgb, var(--brand-red) 25%, transparent); border-radius: var(--r-sm); font-size: var(--fs-xs); color: var(--text-muted); }
  .cta-card__note a { color: var(--brand-red); text-decoration: underline; }
\;
if (buyCssStart !== -1 && factsStart !== -1) {
  c = c.replace(buyCss, newCtaCss);
} else {
  console.log('Failed to find css block');
}

fs.writeFileSync('src/pages/projects/[slug].astro', c);
