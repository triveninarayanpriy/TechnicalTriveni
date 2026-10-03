const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace(/const codeFiles.*/g, ''); // remove any bad ones
c = c.replace('const freeFiles = project.files.filter((f) => f.is_free === 1);', "const codeFiles = project.files.filter(f => f.kind === 'code');\nconst freeFiles = project.files.filter((f) => f.is_free === 1);");
fs.writeFileSync('src/pages/projects/[slug].astro', c);
