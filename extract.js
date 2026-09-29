import fs from 'fs';
let content = fs.readFileSync('drone.json', 'utf16le');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
const data = JSON.parse(content);
fs.writeFileSync('clean_desc.md', data[0].results[0].description, 'utf8');
