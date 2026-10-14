import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILTIN_PAGES,
  getEffectiveContent,
  listEffectivePages,
  importAllBuiltinPages,
  resetPageToDefault,
} from '../src/lib/pages.ts';

// In-memory mock D1 Database for unit testing
function createMockDb() {
  const pagesTable = new Map();
  const revisionsTable = [];

  const mockDb = {
    _pages: pagesTable,
    _revisions: revisionsTable,
    prepare(sql) {
      const exec = (...args) => ({
        async first() {
          if (sql.includes('SELECT * FROM pages WHERE slug = ?')) {
            const slug = args[0];
            return pagesTable.get(slug) || null;
          }
          if (sql.includes('SELECT * FROM page_revisions WHERE id = ?')) {
            const id = args[0];
            return revisionsTable.find((r) => r.id === id) || null;
          }
          return null;
        },
        async all() {
          if (sql.includes('SELECT * FROM pages')) {
            return { results: Array.from(pagesTable.values()) };
          }
          if (sql.includes('SELECT * FROM page_revisions WHERE page_slug = ?')) {
            const slug = args[0];
            const limit = args[1] || 5;
            const filtered = revisionsTable
              .filter((r) => r.page_slug === slug)
              .sort((a, b) => b.created_at - a.created_at)
              .slice(0, limit);
            return { results: filtered };
          }
          return { results: [] };
        },
        async run() {
          if (sql.includes('INSERT INTO pages')) {
            const [slug, title, content_md, image_url, published, meta_title, meta_description, is_custom, updated_at] = args;
            pagesTable.set(slug, {
              slug,
              title,
              content_md,
              image_url,
              published,
              meta_title,
              meta_description,
              is_custom,
              updated_at,
            });
            return { meta: { last_row_id: 1, changes: 1 } };
          }
          if (sql.includes('DELETE FROM pages WHERE slug = ?')) {
            const slug = args[0];
            pagesTable.delete(slug);
            return { meta: { changes: 1 } };
          }
          if (sql.includes('INSERT INTO page_revisions')) {
            const [page_slug, title, content_md, meta_title, meta_description, source, note, created_at] = args;
            const id = revisionsTable.length + 1;
            revisionsTable.push({
              id,
              page_slug,
              title,
              content_md,
              meta_title,
              meta_description,
              source,
              note,
              created_at,
            });
            return { meta: { last_row_id: id } };
          }
          return { meta: {} };
        },
      });

      return {
        bind(...args) {
          return exec(...args);
        },
        all: () => exec().all(),
        first: () => exec().first(),
        run: () => exec().run(),
      };
    },
  };

  return mockDb;
}

test('BUILTIN_PAGES catalog covers all 7 core pages and legal pages with non-empty defaults', () => {
  const expectedSlugs = [
    'about',
    'affiliate',
    'contact',
    'cookies',
    'digital-delivery',
    'disclaimer',
    'how-it-works',
    'terms',
    'privacy',
    'refund',
  ];

  for (const slug of expectedSlugs) {
    const page = BUILTIN_PAGES[slug];
    assert.ok(page, `Missing built-in page definition for "${slug}"`);
    assert.ok(page.title.length > 0, `Title should not be empty for "${slug}"`);
    assert.ok(page.defaultMarkdown.length > 20, `Default markdown should be substantial for "${slug}"`);
    assert.ok(page.route.startsWith('/'), `Route should be valid URL path for "${slug}"`);
    assert.ok(page.category === 'info' || page.category === 'legal', `Category must be info or legal for "${slug}"`);
  }
});

test('getEffectiveContent returns default built-in content when database has no row', async () => {
  const db = createMockDb();
  const effectiveAbout = await getEffectiveContent(db, 'about');

  assert.equal(effectiveAbout.slug, 'about');
  assert.equal(effectiveAbout.title, 'About');
  assert.equal(effectiveAbout.source, 'default');
  assert.equal(effectiveAbout.is_custom, false);
  assert.ok(effectiveAbout.markdown.includes('Real builds. Tested on the workbench.'));
  assert.ok(effectiveAbout.markdown.includes('Triveni'));
  assert.equal(effectiveAbout.published, 1);
  assert.equal(effectiveAbout.route, '/about');
});

test('getEffectiveContent returns custom row when custom override exists in database', async () => {
  const db = createMockDb();
  // Simulate user custom saving
  db._pages.set('about', {
    slug: 'about',
    title: 'Custom About Triveni',
    content_md: '## Custom Title\n\nCustom biography written in editor.',
    image_url: '/custom-photo.jpg',
    published: 1,
    meta_title: 'Custom About Meta',
    meta_description: 'Custom bio description',
    is_custom: 1,
    updated_at: 1791980000,
  });

  const effectiveAbout = await getEffectiveContent(db, 'about');

  assert.equal(effectiveAbout.source, 'custom');
  assert.equal(effectiveAbout.is_custom, true);
  assert.equal(effectiveAbout.title, 'Custom About Triveni');
  assert.equal(effectiveAbout.markdown, '## Custom Title\n\nCustom biography written in editor.');
  assert.equal(effectiveAbout.image_url, '/custom-photo.jpg');
});

test('getEffectiveContent falls back to default if database row has empty content or is_custom is 0', async () => {
  const db = createMockDb();
  db._pages.set('contact', {
    slug: 'contact',
    title: 'Contact Us',
    content_md: '   ', // whitespace only
    image_url: '',
    published: 1,
    meta_title: '',
    meta_description: '',
    is_custom: 0,
    updated_at: 1700000000,
  });

  const effectiveContact = await getEffectiveContent(db, 'contact');
  assert.equal(effectiveContact.source, 'default');
  assert.equal(effectiveContact.is_custom, false);
  assert.ok(effectiveContact.markdown.includes('We would love to hear from you.'));
});

test('importAllBuiltinPages copies defaults to DB idempotently without overwriting custom pages', async () => {
  const db = createMockDb();

  // Pre-seed an existing custom page
  db._pages.set('about', {
    slug: 'about',
    title: 'Custom About Prior To Import',
    content_md: '## My custom about content',
    published: 1,
    is_custom: 1,
    updated_at: 1791980000,
  });

  // Run import
  const { imported, skipped } = await importAllBuiltinPages(db);

  assert.equal(skipped, 1, 'Should skip the 1 existing custom about page');
  assert.ok(imported >= 9, 'Should import the remaining built-in pages');

  // Verify custom about page was preserved
  const aboutAfter = db._pages.get('about');
  assert.equal(aboutAfter.title, 'Custom About Prior To Import');
  assert.equal(aboutAfter.content_md, '## My custom about content');

  // Verify other pages like contact were imported as custom rows with revision log
  const contactAfter = db._pages.get('contact');
  assert.ok(contactAfter);
  assert.equal(contactAfter.is_custom, 1);
  assert.ok(contactAfter.content_md.includes('technicaltriveniyt@gmail.com'));

  // Second run should skip all (idempotency)
  const secondRun = await importAllBuiltinPages(db);
  assert.equal(secondRun.imported, 0);
  assert.equal(secondRun.skipped, Object.keys(BUILTIN_PAGES).length);
});

test('resetPageToDefault deletes the custom override and records a revision', async () => {
  const db = createMockDb();
  db._pages.set('about', {
    slug: 'about',
    title: 'Temporary Custom About',
    content_md: 'Will be reset',
    published: 1,
    is_custom: 1,
    updated_at: 1791980000,
  });

  await resetPageToDefault(db, 'about');

  assert.equal(db._pages.has('about'), false, 'Custom row should be deleted from DB');

  // getEffectiveContent now returns default
  const effective = await getEffectiveContent(db, 'about');
  assert.equal(effective.source, 'default');
  assert.equal(effective.is_custom, false);
  assert.ok(effective.markdown.includes('Real builds. Tested on the workbench.'));

  // Revision was recorded
  assert.ok(db._revisions.some((r) => r.page_slug === 'about' && r.note === 'Reset to default content'));
});

test('listEffectivePages merges all built-in and custom pages cleanly', async () => {
  const db = createMockDb();
  db._pages.set('digital-delivery', {
    slug: 'digital-delivery',
    title: 'Digital Delivery Policy',
    content_md: 'Custom digital delivery rules.',
    published: 1,
    is_custom: 1,
    updated_at: 1791980000,
  });

  const allPages = await listEffectivePages(db);
  assert.ok(allPages.length >= 10);

  const dd = allPages.find((p) => p.slug === 'digital-delivery');
  assert.ok(dd);
  assert.equal(dd.source, 'custom');
  assert.equal(dd.is_custom, true);
  assert.equal(dd.markdown, 'Custom digital delivery rules.');

  const about = allPages.find((p) => p.slug === 'about');
  assert.ok(about);
  assert.equal(about.source, 'default');
  assert.equal(about.is_custom, false);
});
