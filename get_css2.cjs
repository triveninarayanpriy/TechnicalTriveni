const fs = require('fs');
const html = fs.readFileSync('drone_live2.html', 'utf8');

const match = html.match(/grid-template-areas:"([^"]+)"/g);
console.log(match);
