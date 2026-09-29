const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace(/    <\/aside>\n  <\/div>\n<\/div>\n<!-- end \.container\.dp -->\n    <\/div>\n  <\/div>/, '    </aside>\n    </div>\n  </div>');
fs.writeFileSync('src/pages/projects/[slug].astro', c);
