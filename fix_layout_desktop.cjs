const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(/grid-template-areas:\s*"title title"\s*"media media"\s*"facts sidebar"\s*"content sidebar";/, 
\grid-template-areas:
      "title sidebar"
      "media sidebar"
      "facts sidebar"
      "content sidebar";\);

// Remove sticky from proj-sidebar-inner
c = c.replace('.proj-sidebar-inner {\n      position: sticky;\n      top: calc(var(--header-h) + 1.5rem);', '.proj-sidebar-inner {\n      /* removed sticky per request */');

// Remove sticky from cta-card
c = c.replace(/\.cta-card\s*\{\s*position:\s*sticky;\s*top:\s*calc[^\}]+}/, '.cta-card { padding: 1.25rem; margin-top: 0.25rem; }');

fs.writeFileSync('src/pages/projects/[slug].astro', c);
