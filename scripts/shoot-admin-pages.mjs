import puppeteer from 'puppeteer';

const BASE_URL = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

async function main() {
  console.log('📸 Launching Puppeteer to capture visual verification screenshots...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Login
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.type('input[name="email"]', 'admin@technicaltriveni.com');
    await page.type('input[name="password"]', 'triveni-admin-2026');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('button[type="submit"]'),
    ]);
    console.log('✓ Logged in as admin');

    // 2. Desktop Admin Pages List
    await page.goto(`${BASE_URL}/admin/pages`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/admin_pages_desktop_list.png` });
    console.log('✓ Captured admin_pages_desktop_list.png');

    // 3. Desktop Admin Edit About Page
    await page.goto(`${BASE_URL}/admin/pages/about`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/admin_pages_desktop_editor.png` });
    console.log('✓ Captured admin_pages_desktop_editor.png');

    // 4. Mobile Admin Pages List
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/admin/pages`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/admin_pages_mobile_list.png` });
    console.log('✓ Captured admin_pages_mobile_list.png');

    // 5. Mobile Admin Edit About Page
    await page.goto(`${BASE_URL}/admin/pages/about`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/admin_pages_mobile_editor.png` });
    console.log('✓ Captured admin_pages_mobile_editor.png');

    // 6. Public Live About Page
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/about`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/public_about_live.png` });
    console.log('✓ Captured public_about_live.png');

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
