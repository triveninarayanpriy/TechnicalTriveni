const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/triveni-local.sqlite3');
db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO projects (
      slug, title, summary, description, category, difficulty, is_new,
      cover_image, tags, published, sort, meta_title, meta_description
    ) VALUES (
      'free-tools-for-students-india-2026',
      'Free Tools for Students in India (2026)',
      '23 useful student tools and offers with official links, eligibility guidance and a free downloadable PDF.',
      'Resource guide for students.',
      'Resource',
      'Beginner',
      1,
      '/covers/student-tools-2026.png',
      '["Students","Free Tools","Software","AI","Cloud","GitHub","ECE","VLSI","Engineering"]',
      1,
      100,
      'Free Tools for Students in India 2026: Verified List',
      '23 useful student tools and offers in India — GitHub, Gemini, Azure, JetBrains, Figma and more, with official links, eligibility details and a free PDF.'
    )
  `);
  stmt.run((err) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        console.log('Project already exists in DB');
      } else {
        console.error('Error inserting project:', err);
      }
    } else {
      console.log('Project inserted successfully');
    }
  });
  stmt.finalize();
});
db.close();
