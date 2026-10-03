const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (let tc of obj.tool_calls) {
        if (tc.name === 'view_file' && tc.args.AbsolutePath.includes('[slug].astro')) {
          console.log(obj.created_at, tc.args.AbsolutePath);
        }
      }
    }
  } catch(e) {}
}
