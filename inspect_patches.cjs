const fs = require('fs');
const patches = JSON.parse(fs.readFileSync('C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/patches.json', 'utf8'));
for(let p of patches) {
  if (p.Instruction.includes('layout') || p.Instruction.includes('sidebar') || p.Instruction.includes('ToC')) {
     console.log('--- ' + p.Instruction);
     console.log('Target:');
     console.log(p.TargetContent.substring(0, 100));
     console.log('Replacement:');
     console.log(p.ReplacementContent.substring(0, 200));
  }
}
