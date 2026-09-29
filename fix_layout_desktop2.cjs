const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace('grid-template-areas:\n      "title title"\n      "media media"\n      "facts sidebar"\n      "content sidebar";',
'grid-template-areas:\n      "title sidebar"\n      "media sidebar"\n      "facts sidebar"\n      "content sidebar";');

c = c.replace('.proj-sidebar-inner {\n      position: sticky;\n      top: calc(var(--header-h) + 1.5rem);', '.proj-sidebar-inner {\n      /* removed sticky per request */');

c = c.replace(/\.cta-card \{ position: sticky;[^}]+}/, '.cta-card { padding: 1.25rem; margin-top: 0.25rem; }');

fs.writeFileSync('src/pages/projects/[slug].astro', c);
