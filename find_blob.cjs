const { execSync } = require('child_process');
const blobs = execSync('git fsck --lost-found').toString().split('\n').filter(l => l.includes('blob ')).map(l => l.split(' ')[2]);
for (let b of blobs) {
  if (!b) continue;
  try {
    let content = execSync('git cat-file -p ' + b).toString();
    if (content.length > 30000 && content.includes('proj-layout')) {
      console.log('FOUND MATCHING BLOB:', b);
    }
  } catch(e) {}
}
