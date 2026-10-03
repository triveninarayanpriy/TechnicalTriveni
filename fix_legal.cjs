const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages', 'legal');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));
for (const f of files) {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/<p><em>This is a template[^<]+<\/em><\/p>\s*/g, '');
  content = content.replace(/<p><em>This page explains the limits[^<]+<\/em><\/p>\s*/g, '');
  fs.writeFileSync(p, content);
}
