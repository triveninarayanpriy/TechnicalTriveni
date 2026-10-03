const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    
    if (obj.created_at >= '2026-09-28T17:39:40Z' && obj.created_at <= '2026-09-28T17:39:50Z') {
      console.log(obj.source, obj.type, obj.content.substring(0, 100).replace(/\n/g, ' '));
    }
  } catch(e) {}
}
