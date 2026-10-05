const fs = require('fs');
const content = fs.readFileSync('free-tools-for-students-india-2026-article.md', 'utf8');
const body = content.split('---')[2].trim();
let fixedBody = body.replace(
  '[link placeholder]',
  '/downloads/Technical-Triveni_Student-Free-Tools-India-2026.pdf'
);
fixedBody = fixedBody.replace(
  'Download the PDF version with every official link: /downloads/Technical-Triveni_Student-Free-Tools-India-2026.pdf',
  '> **GET THE FULL GUIDE:** [Download the FREE PDF](/downloads/Technical-Triveni_Student-Free-Tools-India-2026.pdf) with all 23 tools, official provider links, eligibility details and verification guidance.'
);
const escapedBody = fixedBody.replace(/'/g, "''");
fs.writeFileSync('update.sql', `UPDATE projects SET description = '${escapedBody}' WHERE slug = 'free-tools-for-students-india-2026';`);
console.log('Created update.sql');
