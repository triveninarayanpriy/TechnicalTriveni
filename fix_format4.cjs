const fs = require('fs');
let c = fs.readFileSync('src/lib/format.ts', 'utf8');
const searchStr = 'export function formatINR(rupees: number): string {\\n  return ';
const startIdx = c.indexOf('export function formatINR');
const endIdx = c.indexOf('}', startIdx);
const newC = c.substring(0, startIdx) + 'export function formatINR(rupees: number): string {\\n  return String.fromCharCode(8377) + INR.format(Math.round(rupees || 0));\\n' + c.substring(endIdx);
fs.writeFileSync('src/lib/format.ts', newC);
