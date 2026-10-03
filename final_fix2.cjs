const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(/grid-template-areas:\s*"title media"\s*"content media"\s*"content sidebar";/g, 'grid-template-areas:\\n      "title sidebar"\\n      "media sidebar"\\n      "facts sidebar"\\n      "content sidebar";');

c = c.replace(/grid-template-areas:\s*"title"\s*"media"\s*"facts"\s*"content"\s*"sidebar";/g, 'grid-template-areas:\\n        "title"\\n        "media"\\n        "sidebar"\\n        "facts"\\n        "content";');

c = c.replace(/grid-template-rows:\s*auto auto auto;/g, '');
c = c.replace(/grid-template-rows:\s*auto auto auto auto;/g, '');

const buyCard = c.substring(c.indexOf('<!-- Inline Buy / Free card -->'), c.indexOf('<!-- Quick action buttons -->'));
const r1 = fs.readFileSync('replace1.txt', 'utf8').replace(/\r\n/g, '\n');
const ctaCard = r1.substring(r1.indexOf('<!-- Inline Buy / Free card -->'), r1.indexOf('<!-- Quick action buttons -->'));

if (buyCard && ctaCard) c = c.replace(buyCard, ctaCard);

const tocOld = c.substring(c.indexOf('<nav class="toc'), c.indexOf('</aside>'));
const tocNew = r1.substring(r1.indexOf('<nav class="toc'), r1.indexOf('</aside>'));
if (tocOld && tocNew) c = c.replace(tocOld, tocNew);

const buyCss = c.substring(c.indexOf('  /* CTA buy / free card */'), c.indexOf('  .facts { padding: 1.25rem; }'));
const newCtaCss = fs.readFileSync('replace1.txt', 'utf8').substring(fs.readFileSync('replace1.txt', 'utf8').indexOf('  /* CTA buy / free card */'), fs.readFileSync('replace1.txt', 'utf8').indexOf('  /* Facts bar */'));

if (buyCss && newCtaCss) c = c.replace(buyCss, newCtaCss);

fs.writeFileSync('src/pages/projects/[slug].astro', c);
