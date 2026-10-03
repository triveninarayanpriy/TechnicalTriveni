const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.source === 'USER_EXPLICIT' && obj.created_at > '2026-09-28T23:59:59Z') {
      console.log(obj.created_at, obj.content);
    }
  } catch(e) {}
}
