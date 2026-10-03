const fs = require('fs');
const cssFiles = fs.readdirSync('dist/client/_astro').filter(f => f.endsWith('.css'));
for (let file of cssFiles) {
  const css = fs.readFileSync('dist/client/_astro/' + file, 'utf8');
  if (css.includes('.proj-layout')) {
    console.log(file, 'has proj-layout');
    const match = css.match(/\.proj-layout\[[^\]]+\]\{[^}]+\}/);
    console.log(match ? match[0] : 'not found');
  }
}
