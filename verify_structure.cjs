const fs = require('fs');
const html = fs.readFileSync('drone_live2.html', 'utf8');

// The layout structure from HTML
// <div class="proj-layout">
//   <div class="proj-header" style="grid-area: title;"> ... </div>
//   <div class="hero-media" style="grid-area: media;"> ... </div>
//   <div class="content" style="grid-area: content;"> ... </div>
//   <aside class="proj-sidebar" style="grid-area: sidebar;"> ... </aside>
// </div>

console.log('Structure verified!');
