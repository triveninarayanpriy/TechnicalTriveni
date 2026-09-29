const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace('grid-template-areas:\\n      "title title"\\n      "media media"\\n      "facts sidebar"\\n      "content sidebar";', 
'grid-template-areas:\n      "title title"\n      "media media"\n      "facts sidebar"\n      "content sidebar";');

c = c.replace('grid-template-areas:\\n          "title"\\n          "media"\\n          "facts"\\n          "content"\\n          "sidebar";',
'grid-template-areas:\n          "title"\n          "media"\n          "facts"\n          "content"\n          "sidebar";');

fs.writeFileSync('src/pages/projects/[slug].astro', c);
