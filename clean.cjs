const fs = require('fs');
const content = fs.readFileSync('drone_desc_utf8.md', 'utf8');
const match = content.match(/"description": "(.*?)"\n\s+\}/s);
if (match) {
  // Decode the JSON string
  const text = JSON.parse('{"desc": "' + match[1] + '"}').desc;
  fs.writeFileSync('clean_desc.md', text);
}
