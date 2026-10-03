const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.source === 'MODEL' && obj.type === 'GENERIC' && obj.content && obj.content.includes('%5Bslug%5D.astro')) {
      if (obj.content.includes('1: ')) {
        console.log(obj.created_at, 'Full read of [slug].astro!');
      }
    }
  } catch(e) {}
}
