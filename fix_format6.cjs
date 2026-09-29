const fs = require('fs');
let lines = fs.readFileSync('src/lib/format.ts', 'utf8').split('\n');
let newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export function formatINR')) {
    newLines.push('export function formatINR(rupees: number): string {');
    newLines.push('  return String.fromCharCode(8377) + INR.format(Math.round(rupees || 0));');
    newLines.push('}');
    // Skip until we see an empty line or the next export
    while(i+1 < lines.length && !lines[i+1].includes('export function formatDate')) {
      i++;
    }
  } else {
    newLines.push(lines[i]);
  }
}
fs.writeFileSync('src/lib/format.ts', newLines.join('\n'));
