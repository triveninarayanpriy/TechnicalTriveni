const fs = require('fs');
const html = fs.readFileSync('drone_live2.html', 'utf8');

const mediaStart = html.indexOf('<!-- 3. Sidebar (Buy Card + ToC) -->');
console.log(html.slice(mediaStart, mediaStart + 2500));
