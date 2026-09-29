const fs = require('fs');
let c = fs.readFileSync('src/lib/format.ts', 'utf8');
const startIdx = c.indexOf('export function formatINR(rupees: number): string {\\n');
c = c.replace(/export function formatINR\(rupees: number\): string \{\\n  return String\.fromCharCode\(8377\) \+ INR\.format\(Math\.round\(rupees \|\| 0\)\);\\n\}`;?\r?\n  \}/, 'export function formatINR(rupees: number): string {\n  return String.fromCharCode(8377) + INR.format(Math.round(rupees || 0));\n}');
fs.writeFileSync('src/lib/format.ts', c);
