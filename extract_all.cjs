const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    if (f.isDirectory()) {
      search(path.join(dir, f.name));
    } else if (f.name === 'transcript_full.jsonl') {
       const lines = fs.readFileSync(path.join(dir, f.name), 'utf8').split('\n');
       for(let i = lines.length-1; i>=0; i--) {
          if (!lines[i]) continue;
          try {
            const obj = JSON.parse(lines[i]);
            if (obj.tool_calls) {
              for (const call of obj.tool_calls) {
                if (call.name && call.name.includes('write_to_file')) {
                   const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
                   if (args.TargetFile && args.TargetFile.endsWith('[slug].astro')) {
                      console.log('Found write to', args.TargetFile, 'in', path.join(dir, f.name));
                      fs.writeFileSync('src/pages/projects/[slug].astro', args.CodeContent);
                      console.log('Restored!');
                      process.exit(0);
                   }
                }
              }
            }
          } catch (e) {}
       }
    }
  }
}

search('C:/Users/Acer/.gemini/antigravity/brain/');
console.log('Not found');
