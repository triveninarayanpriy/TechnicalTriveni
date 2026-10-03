const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

let edits = [];

for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (let t of obj.tool_calls) {
        if (t.name === 'replace_file_content' || t.name === 'write_to_file') {
          if (t.args.TargetFile && t.args.TargetFile.includes('[slug].astro')) {
            if (obj.created_at < '2026-09-29T07:34:00Z') {
              edits.push({
                time: obj.created_at,
                name: t.name,
                args: t.args
              });
            }
          }
        }
      }
    }
  } catch(e) {}
}

fs.writeFileSync('all_edits.json', JSON.stringify(edits, null, 2));
console.log('Saved', edits.length, 'edits!');
