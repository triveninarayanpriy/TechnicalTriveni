const fs = require('fs');
let content = fs.readFileSync('slug_old.astro', 'utf16le');
if (content.charCodeAt(0) === 0xFEFF) content = content.substring(1);
content = content.replace(/\r\n/g, '\n');

const patches = JSON.parse(fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/patches.json', 'utf8'));

let successCount = 0;
for (let i = 0; i < patches.length; i++) {
  const p = patches[i];
  const target = p.TargetContent.replace(/\r\n/g, '\n');
  const repl = p.ReplacementContent.replace(/\r\n/g, '\n');
  if (content.includes(target)) {
     content = content.replace(target, repl);
     successCount++;
  } else {
     console.log('Patch ' + i + ' failed!');
  }
}
fs.writeFileSync('slug_reconstructed.astro', content, 'utf8');
console.log('Reconstructed length: ' + content.length);
console.log('Successfully applied ' + successCount + ' out of ' + patches.length);
