const fs = require('fs');
let c = fs.readFileSync('astro.config.mjs', 'utf8');
c = c.replace(/https:\/\/technicaltriveni\.com/g, 'https://www.technicaltriveni.me');
fs.writeFileSync('astro.config.mjs', c);

c = fs.readFileSync('wrangler.toml', 'utf8');
c = c.replace(/SITE_URL = "https:\/\/technical-triveni\.innovationhubnitp\.workers\.dev"/g, 'SITE_URL = "https://www.technicaltriveni.me"');
fs.writeFileSync('wrangler.toml', c);

c = fs.readFileSync('src/lib/email.ts', 'utf8');
c = c.replace(/https:\/\/technicaltriveni\.com/g, 'https://www.technicaltriveni.me');
c = c.replace(/>technicaltriveni\.com</g, '>technicaltriveni.me<');
fs.writeFileSync('src/lib/email.ts', c);
