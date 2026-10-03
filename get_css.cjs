const fs = require('fs');
const html = fs.readFileSync('drone_live2.html', 'utf8');

const match = html.match(/\.proj-layout\{[^}]+\}/);
console.log(match ? match[0] : 'No proj-layout css found');
