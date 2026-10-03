const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (let t of obj.tool_calls) {
        if (t.name === 'replace_file_content' || t.name === 'write_to_file') {
          if (t.args.TargetFile && t.args.TargetFile.includes('[slug].astro') && t.args.ReplacementContent && t.args.ReplacementContent.includes('proj-layout')) {
            console.log(obj.created_at, 'Added proj-layout');
          }
        }
      }
    }
  } catch(e) {}
}
