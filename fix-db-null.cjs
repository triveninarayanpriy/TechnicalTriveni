const fs = require('fs');
let c = fs.readFileSync('src/lib/db.ts', 'utf8');

c = c.replace(/SELECT DISTINCT category FROM projects WHERE category != ''/, "SELECT DISTINCT category FROM projects WHERE category IS NOT NULL AND category != ''");
c = c.replace(/SELECT tags FROM projects WHERE tags != ''/, "SELECT tags FROM projects WHERE tags IS NOT NULL AND tags != ''");

fs.writeFileSync('src/lib/db.ts', c);
