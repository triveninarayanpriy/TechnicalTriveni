import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BEFORE_DIR = path.join(ARTIFACT_DIR, 'before_80pct');
if (!fs.existsSync(BEFORE_DIR)) {
  fs.mkdirSync(BEFORE_DIR, { recursive: true });
}

const BASE_URL = 'https://www.technicaltriveni.me';

async function main() {
  console.log('📸 Launching Puppeteer to capture BEFORE screenshots at 100% zoom...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45000);

    // 1. Capture public pages across viewports
    const publicPages = [
      { name: 'home', path: '/' },
      { name: 'projects', path: '/projects' },
      { name: 'pack_detail', path: '/projects/fpv-drone-build-guide-betaflight' },
      { name: 'about', path: '/about' },
      { name: 'contact', path: '/contact' },
      { name: 'how_it_works', path: '/how-it-works' },
    ];

    const widths = [1024, 1280, 1440, 1920];

    for (const w of widths) {
      console.log(`\n--- Viewport width: ${w}px ---`);
      await page.setViewport({ width: w, height: 900 });

      for (const p of publicPages) {
        try {
          await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle2' });
          await new Promise(r => setTimeout(r, 800));

          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
          console.log(`[${w}px] ${p.name}: clientWidth=${clientWidth}, scrollWidth=${scrollWidth}`);

          // Take screenshot of above-the-fold
          const filename = path.join(BEFORE_DIR, `before_${p.name}_${w}px.png`);
          await page.screenshot({ path: filename, clip: { x: 0, y: 0, width: w, height: 900 } });
        } catch (err) {
          console.error(`Error on ${p.name} at ${w}px:`, err.message);
        }
      }
    }

    // 2. Mobile 390px check
    console.log(`\n--- Mobile 390px ---`);
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    for (const p of publicPages) {
      try {
        await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 600));
        const filename = path.join(BEFORE_DIR, `before_${p.name}_mobile_390px.png`);
        await page.screenshot({ path: filename, clip: { x: 0, y: 0, width: 390, height: 844 } });
      } catch (err) {
        console.error(`Error on mobile ${p.name}:`, err.message);
      }
    }

    // 3. Admin login and pages
    console.log(`\n--- Logging into Admin on Live ---`);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'admin@technicaltriveni.com');
    await page.type('input[name="password"]', 'triveni-admin-2026');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    console.log('Logged in URL:', page.url());

    const adminPages = [
      { name: 'admin_dashboard', path: '/admin' },
      { name: 'admin_projects', path: '/admin/projects' },
      { name: 'admin_orders', path: '/admin/orders' },
      { name: 'admin_pages', path: '/admin/pages' },
      { name: 'admin_settings', path: '/admin/settings' },
    ];

    for (const ap of adminPages) {
      try {
        await page.goto(`${BASE_URL}${ap.path}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 800));
        const filename = path.join(BEFORE_DIR, `before_${ap.name}_1440px.png`);
        await page.screenshot({ path: filename, clip: { x: 0, y: 0, width: 1440, height: 900 } });
        console.log(`Saved ${ap.name}`);
      } catch (err) {
        console.error(`Error on ${ap.name}:`, err.message);
      }
    }

    console.log('✅ BEFORE screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
