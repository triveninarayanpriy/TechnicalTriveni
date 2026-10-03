const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.created_at === '2026-09-28T17:37:26Z') {
      let contentLines = obj.content.split('\n');
      console.log('Total output lines:', contentLines.length);
      console.log(contentLines.slice(0, 10).join('\n'));
    }
  } catch(e) {}
}
