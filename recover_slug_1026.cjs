const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

let lastContent = null;
let lastTime = '';

for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    
    if (obj.created_at && obj.created_at > '2026-09-29T04:56:00Z') {
      break;
    }

    if (obj.source === 'MODEL' && obj.type === 'GENERIC' && obj.content && obj.content.includes('%5Bslug%5D.astro')) {
      lastContent = obj.content;
      lastTime = obj.created_at;
    }
  } catch(e) {}
}

if (lastContent) {
  console.log('Found content from', lastTime);
  let contentLines = lastContent.split('\n');
  
  let startIndex = 0;
  for (let i = 0; i < contentLines.length; i++) {
    if (contentLines[i].startsWith('1: ')) {
      startIndex = i;
      break;
    }
  }
  
  if (startIndex > 0) {
    contentLines = contentLines.slice(startIndex);
    contentLines = contentLines.map(l => l.replace(/^\d+:\s?/, ''));
    
    if (contentLines.length >= 2 && contentLines[contentLines.length - 2].includes('The above content')) {
      contentLines = contentLines.slice(0, -2);
    }
    
    fs.writeFileSync('src/pages/projects/[slug].astro', contentLines.join('\n'));
    console.log('Successfully wrote to [slug].astro');
  }
}
