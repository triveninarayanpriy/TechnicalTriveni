const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Acer\\.gemini\\antigravity\\brain\\426ba6f6-8326-49dd-8004-fd9b9ddf5438\\.system_generated\\logs\\transcript_full.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.content && obj.content.includes('format: <line_number>: <original_line>')) {
    const linesOfCode = obj.content.split('\n');
    let code = [];
    let parsing = false;
    for (const l of linesOfCode) {
      if (l.includes('format: <line_number>: <original_line>')) {
        parsing = true;
        continue;
      }
      if (l.includes('The above content shows the entire, complete file')) {
        parsing = false;
        break;
      }
      if (parsing) {
        const idx = l.indexOf(': ');
        if (idx !== -1 && /^\d+$/.test(l.slice(0, idx))) {
          code.push(l.slice(idx + 2));
        } else {
          code.push(l);
        }
      }
    }
    fs.writeFileSync('editor_recovered.astro', code.join('\n'));
    console.log('Recovered!');
    break;
  }
}
