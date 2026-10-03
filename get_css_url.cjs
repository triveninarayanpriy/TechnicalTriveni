const fs = require('fs');
const html = fs.readFileSync('drone_live2.html', 'utf8');

const matches = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
console.log(matches);
