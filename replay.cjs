const fs = require('fs');
const { execSync } = require('child_process');

execSync('git show e9953ea:src/pages/projects/[slug].astro > replay_slug.astro');

const edits = JSON.parse(fs.readFileSync('all_edits.json', 'utf8'));
let c = fs.readFileSync('replay_slug.astro', 'utf8');

let failCount = 0;
for (let e of edits) {
  if (e.name === 'write_to_file') {
    c = e.args.CodeContent;
  } else if (e.name === 'replace_file_content') {
    let t = e.args.TargetContent;
    let r = e.args.ReplacementContent;
    // Normalize newlines
    t = t.replace(/\\r\\n/g, '\\n');
    c = c.replace(/\\r\\n/g, '\\n');
    r = r.replace(/\\r\\n/g, '\\n');
    
    if (c.includes(t)) {
      c = c.replace(t, r);
    } else {
      console.log('FAILED TO MATCH at', e.time);
      console.log('Target starts with:', t.slice(0, 100));
      failCount++;
    }
  }
}
fs.writeFileSync('replay_slug_final.astro', c);
console.log('Finished with', failCount, 'failures');
