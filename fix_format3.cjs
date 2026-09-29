const fs = require('fs');
let c = fs.readFileSync('src/lib/format.ts', 'utf8');
const search = /export function formatINR[\\s\\S]*?\\}/;
const replace = 'export function formatINR(rupees: number): string {\\n  return String.fromCharCode(8377) + INR.format(Math.round(rupees || 0));\\n}';
c = c.replace(search, replace);
fs.writeFileSync('src/lib/format.ts', c);
