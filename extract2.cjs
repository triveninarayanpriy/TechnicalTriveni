const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

for(let i = lines.length-1; i>=0; i--) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'replace_file_content') {
           const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
           if (args.TargetFile && args.TargetFile.endsWith('src/pages/projects/[slug].astro')) {
              console.log('Found write to', args.TargetFile);
              if (call.name === 'write_to_file') {
                 fs.writeFileSync('src/pages/projects/[slug].astro', args.CodeContent);
                 console.log('Restored!');
                 process.exit(0);
              }
           }
        }
      }
    }
  } catch (e) {}
}
console.log('Not found');
