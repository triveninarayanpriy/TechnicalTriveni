const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

// 1. Fix grid layout CSS
const oldCss = \  .proj-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "title media"
      "content media"
      "content sidebar";
    gap: 1.5rem 2.5rem;
    align-items: start;
  }\;

const newCss = \  .proj-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    grid-template-areas:
      "title sidebar"
      "media sidebar"
      "facts sidebar"
      "content sidebar";
    gap: 1.5rem 2.5rem;
    align-items: start;
  }\;
c = c.replace(oldCss, newCss);

const oldMobileCss = \  @media (max-width: 900px) {
    .proj-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
      grid-template-areas:
        "title"
        "media"
        "facts"
        "content"
        "sidebar";
      gap: 1.5rem;
    }\;

const newMobileCss = \  @media (max-width: 900px) {
    .proj-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "title"
        "media"
        "sidebar"
        "facts"
        "content";
      gap: 1.5rem;
    }\;
c = c.replace(oldMobileCss, newMobileCss);

// 2. Fix the buy-card / cta-card HTML
const buyCard = c.substring(c.indexOf('<!-- Inline Buy / Free card -->'), c.indexOf('<!-- Quick action buttons -->'));
const r1 = fs.readFileSync('replace1.txt', 'utf8').replace(/\\r\\n/g, '\\n');
const ctaCard = r1.substring(r1.indexOf('<!-- Inline Buy / Free card -->'), r1.indexOf('<!-- Quick action buttons -->'));

if (buyCard && ctaCard) {
  c = c.replace(buyCard, ctaCard);
}

// 3. Fix the toc link references (toc is also in r1)
const tocOld = c.substring(c.indexOf('<nav class="toc'), c.indexOf('</aside>'));
const tocNew = r1.substring(r1.indexOf('<nav class="toc'), r1.indexOf('</aside>'));
if (tocOld && tocNew) {
  c = c.replace(tocOld, tocNew);
}

// 4. Fix any buy-card CSS with cta-card CSS
const buyCss = c.substring(c.indexOf('  /* CTA buy / free card */'), c.indexOf('  .facts { display: grid;'));
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
if (buyCss) {
  c = c.replace(buyCss, newCtaCss);
}

fs.writeFileSync('src/pages/projects/[slug].astro', c);
console.log('Fixed!');
