const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (let t of obj.tool_calls) {
        if (t.name === 'replace_file_content' && obj.created_at === '2026-09-28T17:40:02Z') {
          fs.writeFileSync('target1.txt', t.args.TargetContent);
          fs.writeFileSync('replace1.txt', t.args.ReplacementContent);
        }
        if (t.name === 'replace_file_content' && obj.created_at === '2026-09-28T17:40:33Z') {
          fs.writeFileSync('target2.txt', t.args.TargetContent);
          fs.writeFileSync('replace2.txt', t.args.ReplacementContent);
        }
      }
    }
  } catch(e) {}
}
