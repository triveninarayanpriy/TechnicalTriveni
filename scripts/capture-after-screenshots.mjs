import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const AFTER_DIR = path.join(ARTIFACT_DIR, 'after_80pct');
if (!fs.existsSync(AFTER_DIR)) {
  fs.mkdirSync(AFTER_DIR, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:8788';

async function main() {
  console.log('📸 Launching Puppeteer for comprehensive AFTER visual verification...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45000);

    const publicPages = [
      { name: 'home', path: '/' },
      { name: 'projects', path: '/projects' },
      { name: 'pack_detail', path: '/projects/arduino-drone' },
      { name: 'about', path: '/about' },
      { name: 'contact', path: '/contact' },
      { name: 'how_it_works', path: '/how-it-works' },
    ];

    const widths = [1024, 1280, 1366, 1440, 1536, 1920];
    const metrics = [];

    // 1. Test across all required window widths at 100% zoom
    for (const w of widths) {
      console.log(`\n=== Testing Viewport: ${w}px ===`);
      await page.setViewport({ width: w, height: 900 });

      for (const p of publicPages) {
        await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 600));

        const data = await page.evaluate(() => {
          const doc = document.documentElement;
          const clientWidth = doc.clientWidth;
          const scrollWidth = doc.scrollWidth;
          const rootFontSize = window.getComputedStyle(doc).fontSize;

          // Header inspection
          const header = document.querySelector('.site-header');
          const navDesktop = document.querySelector('.nav-desktop');
          const searchPill = document.querySelector('.desktop-search-pill');
          const downloads = document.querySelector('.nav-link--downloads');
          const freeBtn = document.querySelector('.btn--header');
          const mobileToggle = document.querySelector('[data-nav-toggle]');

          const headerState = {
            headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
            navDesktopVisible: navDesktop ? window.getComputedStyle(navDesktop).display !== 'none' : false,
            searchPillVisible: searchPill ? window.getComputedStyle(searchPill).display !== 'none' : false,
            downloadsVisible: downloads ? window.getComputedStyle(downloads).display !== 'none' : false,
            freeBtnVisible: freeBtn ? window.getComputedStyle(freeBtn).display !== 'none' : false,
            mobileToggleVisible: mobileToggle ? window.getComputedStyle(mobileToggle).display !== 'none' : false,
          };

          return {
            clientWidth,
            scrollWidth,
            hasOverflow: scrollWidth > clientWidth,
            rootFontSize,
            headerState
          };
        });

        metrics.push({ page: p.name, width: w, ...data });

        console.log(`[${w}px] ${p.name}: rootFS=${data.rootFontSize}, clientW=${data.clientWidth}, scrollW=${data.scrollWidth}, overflow=${data.hasOverflow}, headerDesk=${data.headerState.navDesktopVisible}`);

        const filename = path.join(AFTER_DIR, `after_${p.name}_${w}px.png`);
        await page.screenshot({ path: filename, clip: { x: 0, y: 0, width: w, height: 900 } });
      }
    }

    // 2. Mobile 390px verification (must be unchanged, rootFS=16px)
    console.log(`\n=== Mobile Viewport: 390px ===`);
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    for (const p of publicPages) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 500));

      const mobileData = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          rootFontSize: window.getComputedStyle(doc).fontSize,
          clientWidth: doc.clientWidth,
          scrollWidth: doc.scrollWidth,
          hasOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      console.log(`[390px] ${p.name}: rootFS=${mobileData.rootFontSize}, clientW=${mobileData.clientWidth}, scrollW=${mobileData.scrollWidth}, overflow=${mobileData.hasOverflow}`);

      const filename = path.join(AFTER_DIR, `after_${p.name}_mobile_390px.png`);
      await page.screenshot({ path: filename, clip: { x: 0, y: 0, width: 390, height: 844 } });
    }

    // 3. Admin verification
    console.log(`\n=== Admin Pages Verification ===`);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'admin@technicaltriveni.com');
    await page.type('input[name="password"]', 'triveni-admin-2026');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    console.log('✓ Logged in as admin.');

    const adminPages = [
      { name: 'admin_dashboard', path: '/admin' },
      { name: 'admin_projects', path: '/admin/projects' },
      { name: 'admin_project_editor', path: '/admin/projects/12' },
      { name: 'admin_orders', path: '/admin/orders' },
      { name: 'admin_pages', path: '/admin/pages' },
      { name: 'admin_settings', path: '/admin/settings' },
    ];

    for (const ap of adminPages) {
      await page.goto(`${BASE_URL}${ap.path}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 600));

      if (ap.name === 'admin_orders') {
        const row = await page.$('.order-row, [data-order-id], tr[data-id]');
        if (row) {
          await row.click();
          await new Promise(r => setTimeout(r, 400));
        }
      }

      const adminMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          rootFontSize: window.getComputedStyle(doc).fontSize,
          clientWidth: doc.clientWidth,
          scrollWidth: doc.scrollWidth,
          hasOverflow: doc.scrollWidth > doc.clientWidth
        };
      });

      console.log(`[Admin 1440px] ${ap.name}: rootFS=${adminMetrics.rootFontSize}, clientW=${adminMetrics.clientWidth}, scrollW=${adminMetrics.scrollWidth}, overflow=${adminMetrics.hasOverflow}`);

      const filename = path.join(AFTER_DIR, `after_${ap.name}_1440px.png`);
      await page.screenshot({ path: filename, clip: { x: 0, y: 0, width: 1440, height: 900 } });
    }

    // Admin at 1024px
    console.log(`\n=== Admin at 1024px ===`);
    await page.setViewport({ width: 1024, height: 900 });
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(AFTER_DIR, 'after_admin_dashboard_1024px.png'), clip: { x: 0, y: 0, width: 1024, height: 900 } });

    await page.goto(`${BASE_URL}/admin/projects/12`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(AFTER_DIR, 'after_admin_project_editor_1024px.png'), clip: { x: 0, y: 0, width: 1024, height: 900 } });

    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verification_metrics.json'), JSON.stringify(metrics, null, 2));
    console.log('\n✅ Verification metrics written to verification_metrics.json');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
