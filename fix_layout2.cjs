const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(
  /\\.proj-layout \\{\\s+display: grid;\\s+grid-template-columns: 1fr 340px;\\s+grid-template-areas:[^}]+}/m,
  `.proj-layout {\n    display: grid;\n    grid-template-columns: 1fr 340px;\n    grid-template-areas:\n      "title title"\n      "media media"\n      "facts sidebar"\n      "content sidebar";\n    gap: 1.5rem 2.5rem;\n    align-items: start;\n  }`
);

c = c.replace(
  /@media \\(max-width: 900px\\) \\{\\s*\\.proj-layout \\{\\s*grid-template-columns: 1fr;\\s*grid-template-areas:[^}]+}/m,
  `@media (max-width: 900px) {\n    .proj-layout {\n      grid-template-columns: 1fr;\n      grid-template-areas:\n        "title"\n        "media"\n        "facts"\n        "content"\n        "sidebar";\n      gap: 1.5rem;\n    }`
);

c = c.replace(
  /\\.content \\{\\s*grid-area: content;\\s*display: flex;/m,
  `.content { grid-area: content; min-width: 0; display: flex;`
);

fs.writeFileSync('src/pages/projects/[slug].astro', c);