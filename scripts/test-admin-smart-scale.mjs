import puppeteer from 'puppeteer';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7/after_smart_scale';

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Login
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.type('input[name="email"]', 'admin@technicaltriveni.com');
  await page.type('input[name="password"]', 'triveni-admin-2026');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);

  // Test across tiers
  for (const w of [600, 800, 1024, 1440]) {
    await page.setViewport({ width: w, height: 800 });
    await page.goto(`${BASE_URL}/admin?debug=layout`, { waitUntil: 'networkidle2' });
    const res = await page.evaluate((w) => {
      const doc = document.documentElement;
      const bodyFs = parseFloat(window.getComputedStyle(document.body).fontSize);
      const rootFs = parseFloat(window.getComputedStyle(doc).fontSize);
      const sidebar = document.querySelector('.admin-sidebar');
      const bottomNav = document.querySelector('.admin-bottom-nav');
      const sidebarW = sidebar ? sidebar.getBoundingClientRect().width : 0;
      const bottomNavVisible = bottomNav && window.getComputedStyle(bottomNav).display !== 'none';
      
      return {
        w,
        rootFs,
        bodyFs,
        bodyFloorOk: bodyFs >= 13,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
        sidebarW: Math.round(sidebarW),
        bottomNavVisible
      };
    }, w);
    console.log(JSON.stringify(res));
  }

  // Capture Admin Project Editor at 1024 and 1440
  for (const w of [1024, 1440]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(`${BASE_URL}/admin/projects/1?debug=layout`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `after_admin_editor_${w}px.png`), fullPage: false });
    console.log(`Saved after_admin_editor_${w}px.png`);
  }

  await browser.close();
}

main().catch(console.error);
