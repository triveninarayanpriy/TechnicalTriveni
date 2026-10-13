import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE = 'http://127.0.0.1:8788';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();

// Pre-dismiss cookie banner so screenshots show clean application UI
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem('tt-cookie-ack', '1');
  } catch {}
});

async function checkNoHorizontalOverflow(name, vpWidth) {
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const bodyWidth = document.body.scrollWidth;
    return {
      docWidth,
      winWidth,
      bodyWidth,
      hasOverflow: docWidth > winWidth + 1 || bodyWidth > winWidth + 1
    };
  });
  if (overflow.hasOverflow) {
    console.warn(`[WARNING] Horizontal overflow detected on ${name} at ${vpWidth}px! docWidth=${overflow.docWidth}, winWidth=${overflow.winWidth}, bodyWidth=${overflow.bodyWidth}`);
  } else {
    console.log(`[PASS] No horizontal overflow on ${name} at ${vpWidth}px (${overflow.winWidth}px viewport)`);
  }
}

try {
  // ==========================================
  // VIEWPORT 1: Mobile 390x844 (iPhone 14/15)
  // ==========================================
  console.log('\n--- TESTING VIEWPORT: 390x844 ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. Menu open state at 390x844
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  // Click menu toggle
  await page.evaluate(() => {
    const toggle = document.querySelector('[data-nav-toggle]');
    if (toggle) toggle.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Menu Overlay 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_menu.png` });
  console.log('Saved public_mobile_390_menu.png');

  // Close menu
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-nav-close]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  // 2. Projects Listing 390
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Projects 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_projects.png` });
  console.log('Saved public_mobile_390_projects.png');

  // 3. About 390
  await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('About 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_about.png` });
  console.log('Saved public_mobile_390_about.png');

  // 4. Contact 390
  await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Contact 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_contact.png` });
  console.log('Saved public_mobile_390_contact.png');

  // 5. My Downloads 390
  await page.goto(`${BASE}/account/downloads`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Downloads 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_downloads.png` });
  console.log('Saved public_mobile_390_downloads.png');

  // ==========================================
  // VIEWPORT 2: Small Mobile 360x800
  // ==========================================
  console.log('\n--- TESTING VIEWPORT: 360x800 ---');
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. Menu open state at 360x800
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const toggle = document.querySelector('[data-nav-toggle]');
    if (toggle) toggle.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Menu Overlay 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_menu.png` });
  console.log('Saved public_mobile_360_menu.png');

  // 2. Projects Listing 360
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Projects 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_projects.png` });
  console.log('Saved public_mobile_360_projects.png');

  // 3. About 360
  await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('About 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_about.png` });
  console.log('Saved public_mobile_360_about.png');

  // 4. Contact 360
  await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Contact 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_contact.png` });
  console.log('Saved public_mobile_360_contact.png');

  // 5. My Downloads 360
  await page.goto(`${BASE}/account/downloads`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Downloads 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_downloads.png` });
  console.log('Saved public_mobile_360_downloads.png');

  // ==========================================
  // VIEWPORT 3: Desktop 1280x800
  // ==========================================
  console.log('\n--- TESTING VIEWPORT: 1280x800 Desktop ---');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  // 1. Projects Desktop
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_desktop_1280_projects.png` });
  console.log('Saved public_desktop_1280_projects.png');

  // 2. About Desktop
  await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_desktop_1280_about.png` });
  console.log('Saved public_desktop_1280_about.png');

  // 3. Contact Desktop
  await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_desktop_1280_contact.png` });
  console.log('Saved public_desktop_1280_contact.png');

  // 4. Downloads Desktop
  await page.goto(`${BASE}/account/downloads`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_desktop_1280_downloads.png` });
  console.log('Saved public_desktop_1280_downloads.png');

  console.log('\nAll follow-up verifications complete!');
} catch (err) {
  console.error('Error during verification:', err);
} finally {
  await browser.close();
}
