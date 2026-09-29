const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/27a37f32-82b5-4a0d-ada3-f9ed3dcc1b78/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
let maxRead = "";
for (let line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.source === 'SYSTEM' && obj.content && obj.content.includes('import Base from')) {
       if (obj.content.length > maxRead.length) {
         if (obj.content.includes('---')) {
            maxRead = obj.content;
         }
       }
    }
  } catch (e) {}
}
fs.writeFileSync('slug_read3.astro', maxRead);
console.log('Recovered. Length: ' + maxRead.length);
