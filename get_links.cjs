const fs = require('fs');
const html = fs.readFileSync('home_live.html', 'utf8');
const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
console.log(links.filter(l => l.includes('/projects/')));
