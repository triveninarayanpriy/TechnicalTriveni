const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

const t1 = '      <!-- 3. Sidebar (Buy Card + ToC) -->\n      <aside class="proj-sidebar" style="grid-area: sidebar;">\n        <div class="proj-sidebar-inner" style="position: sticky; top: calc(var(--header-h) + 1.5rem); display: flex; flex-direction: column; gap: 1.5rem;">';
const r1 = '      <!-- 3. Sidebar (Buy Card + ToC) -->\n      <aside class="proj-sidebar" style="grid-area: sidebar;">\n        <div class="proj-sidebar-inner" style="position: sticky; top: calc(var(--header-h) + 1.5rem); display: flex; flex-direction: column; gap: 1.5rem;">';
// wait, I don't need to replace t1 if it already has proj-sidebar-inner?
