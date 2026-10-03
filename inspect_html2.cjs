const fs = require('fs');
const html = fs.readFileSync('drone_live2.html', 'utf8');

const titleEnd = html.indexOf('</h1><p class="hero-summary"');
const summaryEnd = html.indexOf('</div>', titleEnd);
console.log(html.slice(summaryEnd, summaryEnd + 3000));
