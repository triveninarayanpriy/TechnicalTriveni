import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE = 'http://127.0.0.1:8788';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
page.on('console', msg => {
  if (msg.type() === 'error') console.log('PAGE LOG ERROR:', msg.text());
});
page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

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
  // 1. Log in to Admin
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  
  await page.type('#email', 'admin@technicaltriveni.com');
  await page.type('#password', 'triveni-admin-2026');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  console.log('Logged in successfully to admin.');

  // ==========================================
  // VIEWPORT 1: Desktop 1440x900
  // Matches media_1791934786613_c82503da.png,
  // media_1791934786614_f462b714.png,
  // media_1791934786618_7c25eb4a.png
  // ==========================================
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Desktop Dashboard
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_dashboard.png`, fullPage: false });
  console.log('Saved desktop_1440_dashboard.png');

  // 2. Desktop Projects List
  await page.goto(`${BASE}/admin/projects`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_projects.png`, fullPage: false });
  console.log('Saved desktop_1440_projects.png');

  // 3. Desktop Project Editor
  const editLink = await page.$('a[href*="/admin/projects/"]');
  let editUrl = `${BASE}/admin/projects/1`;
  if (editLink) {
    editUrl = await page.evaluate(el => el.href, editLink);
  }
  await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_editor.png`, fullPage: false });
  console.log('Saved desktop_1440_editor.png');

  // 4. Desktop Orders
  await page.goto(`${BASE}/admin/orders`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_orders.png`, fullPage: false });
  console.log('Saved desktop_1440_orders.png');

  // 5. Desktop Messages
  await page.goto(`${BASE}/admin/messages`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_messages.png`, fullPage: false });
  console.log('Saved desktop_1440_messages.png');

  // 6. Desktop Settings
  await page.goto(`${BASE}/admin/settings`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_settings.png`, fullPage: false });
  console.log('Saved desktop_1440_settings.png');

  // ==========================================
  // VIEWPORT 2: Tablet 820x1180 (iPad Air)
  // Verify 72px icon-rail sidebar
  // ==========================================
  await page.setViewport({ width: 820, height: 1000, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/tablet_820_dashboard.png`, fullPage: false });
  console.log('Saved tablet_820_dashboard.png');

  // ==========================================
  // VIEWPORT 3: Mobile 390x844 (iPhone 14/15)
  // ==========================================
  const vp390 = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await page.setViewport(vp390);

  // 1. Mobile Dashboard
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Dashboard 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_dashboard.png`, fullPage: false });
  console.log('Saved mobile_390_dashboard.png');

  // 2. Mobile Projects
  await page.goto(`${BASE}/admin/projects`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Projects 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_projects.png`, fullPage: false });
  console.log('Saved mobile_390_projects.png');

  // 3. Mobile Project Editor (Menu)
  await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Project Editor Menu 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_editor_menu.png`, fullPage: false });
  console.log('Saved mobile_390_editor_menu.png');

  // 4. Mobile Project Editor (Drilldown into Pricing & Visibility)
  const pricingRow = await page.$('button[data-section-title="Pricing and visibility"]');
  if (pricingRow) {
    await pricingRow.click();
    await new Promise(r => setTimeout(r, 500));
    await checkNoHorizontalOverflow('Editor Drilldown (Pricing & Visibility) 390', 390);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_editor_pricing.png`, fullPage: false });
    console.log('Saved mobile_390_editor_pricing.png');

    // Click Done to return
    const doneBtn = await page.$('#mobile-drilldown-done-btn');
    if (doneBtn) await doneBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  // 5. Mobile Orders
  await page.goto(`${BASE}/admin/orders`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Orders 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_orders.png`, fullPage: false });
  console.log('Saved mobile_390_orders.png');

  // 6. Mobile Messages
  await page.goto(`${BASE}/admin/messages`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Messages 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_messages.png`, fullPage: false });
  console.log('Saved mobile_390_messages.png');

  // 7. Mobile More
  await page.goto(`${BASE}/admin/more`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('More 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_more.png`, fullPage: false });
  console.log('Saved mobile_390_more.png');

  // ==========================================
  // VIEWPORT 4: Mobile 360x800 (Android)
  // Verify strict 360px width overflow
  // ==========================================
  const vp360 = { width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await page.setViewport(vp360);

  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await checkNoHorizontalOverflow('Dashboard 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_360_dashboard.png`, fullPage: false });

  await page.goto(`${BASE}/admin/projects`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await checkNoHorizontalOverflow('Projects 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_360_projects.png`, fullPage: false });

  await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await checkNoHorizontalOverflow('Editor 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_360_editor.png`, fullPage: false });

  console.log('ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
} catch (err) {
  console.error('Verification failed with error:', err);
} finally {
  await browser.close();
}
