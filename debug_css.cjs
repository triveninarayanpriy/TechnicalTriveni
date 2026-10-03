const fs = require('fs');
const css = fs.readFileSync('slug.css', 'utf8');

const match = css.match(/\.proj-layout\[data[^\]]+\]\{[^}]+\}/);
console.log(match ? match[0] : 'not found');
