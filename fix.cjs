const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(
  /grid-template-areas:\s*"title sidebar"\s*"media sidebar"\s*"facts sidebar"\s*"content sidebar";/,
  'grid-template-areas:\\n      "title title"\\n      "media media"\\n      "facts sidebar"\\n      "content sidebar";'
);

c = c.replace(
  /grid-template-areas:\s*"title"\s*"media"\s*"sidebar"\s*"facts"\s*"content";/,
  'grid-template-areas:\\n          "title"\\n          "media"\\n          "facts"\\n          "content"\\n          "sidebar";'
);

c = c.replace('.content {\n    grid-area: content;\n    display: flex;', '.content {\n    grid-area: content;\n    min-width: 0;\n    display: flex;');

fs.writeFileSync('src/pages/projects/[slug].astro', c);
