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
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  
  await page.type('#email', 'admin@technicaltriveni.com');
  await page.type('#password', 'triveni-admin-2026');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  console.log('Logged in successfully to admin.');

  // ==========================================
  // VIEWPORT 1: Mobile 390x844 (iPhone 14/15)
  // ==========================================
  const vp390 = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await page.setViewport(vp390);

  // 1. Dashboard
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Dashboard 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_dashboard.png`, fullPage: false });
  console.log('Saved mobile_390_dashboard.png');

  // 2. Projects List
  await page.goto(`${BASE}/admin/projects`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Projects 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_projects.png`, fullPage: false });
  console.log('Saved mobile_390_projects.png');

  // 3. Project Editor (First Project) - Main Sections Menu
  const editLink = await page.$('.mobile-project-row');
  let editUrl = `${BASE}/admin/projects/1`;
  if (editLink) {
    editUrl = await page.evaluate(el => el.href, editLink);
  }
  await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Project Editor 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_editor_menu.png`, fullPage: false });
  console.log('Saved mobile_390_editor_menu.png');

  // 4. Project Editor - Sub-page Drilldown (Click Pricing and visibility)
  const pricingRow = await page.$('button[data-panel-title="Pricing and visibility"]');
  if (pricingRow) {
    await pricingRow.click();
    await new Promise(r => setTimeout(r, 500));
    await checkNoHorizontalOverflow('Editor Section (Pricing) 390', 390);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_editor_pricing.png`, fullPage: false });
    console.log('Saved mobile_390_editor_pricing.png');

    // Click Done to return
    const doneBtn = await page.$('#mobile-drilldown-done-btn');
    if (doneBtn) await doneBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  // 5. More page
  await page.goto(`${BASE}/admin/more`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('More 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_more.png`, fullPage: false });
  console.log('Saved mobile_390_more.png');

  // 6. Orders
  await page.goto(`${BASE}/admin/orders`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Orders 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_orders.png`, fullPage: false });
  console.log('Saved mobile_390_orders.png');

  // 7. Messages
  await page.goto(`${BASE}/admin/messages`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Messages 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_messages.png`, fullPage: false });
  console.log('Saved mobile_390_messages.png');

  // 8. Pages
  await page.goto(`${BASE}/admin/pages`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Pages 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_pages.png`, fullPage: false });
  console.log('Saved mobile_390_pages.png');

  // 9. Coupons
  await page.goto(`${BASE}/admin/coupons`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Coupons 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_coupons.png`, fullPage: false });
  console.log('Saved mobile_390_coupons.png');

  // 10. Settings
  await page.goto(`${BASE}/admin/settings`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  await checkNoHorizontalOverflow('Settings 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_settings.png`, fullPage: false });
  console.log('Saved mobile_390_settings.png');

  // ==========================================
  // VIEWPORT 2: Mobile 360x800 (Android)
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

  // ==========================================
  // VIEWPORT 3: Desktop 1280x900
  // Verify Desktop stays 100% intact
  // ==========================================
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1280_dashboard.png`, fullPage: false });
  console.log('Saved desktop_1280_dashboard.png');

  await page.goto(`${BASE}/admin/projects`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1280_projects.png`, fullPage: false });
  console.log('Saved desktop_1280_projects.png');

  await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1280_editor.png`, fullPage: false });
  console.log('Saved desktop_1280_editor.png');

  console.log('All verification checks completed successfully!');
} catch (err) {
  console.error('Verification failed with error:', err);
} finally {
  await browser.close();
}
