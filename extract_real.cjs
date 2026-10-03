const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

let lastContent = null;
let lastTime = '';

for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    
    // Find the LAST time view_file outputted the file contents
    if (obj.source === 'MODEL' && obj.type === 'GENERIC' && obj.content && obj.content.includes('%5Bslug%5D.astro')) {
      if (obj.created_at < '2026-09-29T04:56:00Z') {
        lastContent = obj.content;
        lastTime = obj.created_at;
      }
    }
  } catch(e) {}
}

if (lastContent) {
  console.log('Found content from', lastTime);
  let contentLines = lastContent.split('\n');
  
  let startIndex = -1;
  for (let i = 0; i < contentLines.length; i++) {
    if (contentLines[i].startsWith('1: ')) {
      startIndex = i;
      break;
    }
  }
  
  if (startIndex >= 0) {
    contentLines = contentLines.slice(startIndex);
    contentLines = contentLines.map(l => l.replace(/^\\d+:\\s?/, ''));
    
    // Remove the trailer if exists
    let endIdx = contentLines.length;
    for(let i = contentLines.length - 1; i >= 0; i--) {
       if(contentLines[i].includes('The above content is truncated')) {
           endIdx = i;
           break;
       }
    }
    contentLines = contentLines.slice(0, endIdx);
    
    fs.writeFileSync('src/pages/projects/[slug].astro', contentLines.join('\n'));
    console.log('Successfully wrote to [slug].astro');
  } else {
    console.log('Could not find start index!');
  }
}
