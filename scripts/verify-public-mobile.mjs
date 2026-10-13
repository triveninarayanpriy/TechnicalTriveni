import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE = 'http://127.0.0.1:8788';
const SLUG = 'iot-weather-station-esp32';

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

async function scrollToSection(id) {
  const scrolled = await page.evaluate((targetId) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.getElementById(targetId);
    if (el) {
      const y = Math.max(0, el.offsetTop - 110);
      window.scrollTo(0, y);
      return { targetId, y, scrollY: window.scrollY };
    }
    return { error: 'not found: ' + targetId };
  }, id);
  console.log('Scrolled to:', scrolled);
  await new Promise(r => setTimeout(r, 400));
}

try {
  // ==========================================
  // VIEWPORT 1: Mobile 390x844 (iPhone 14/15)
  // ==========================================
  const vp390 = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await page.setViewport(vp390);

  // 1. Home 390
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Homepage 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_home.png` });
  console.log('Saved public_mobile_390_home.png');

  // 2. Pack Detail Page 390 (Top with swipe gallery, counter pill, chips, summary, sticky tabs)
  await page.goto(`${BASE}/projects/${SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Pack page 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_pack_top.png` });
  console.log('Saved public_mobile_390_pack_top.png');

  // 3. Parts list section
  await scrollToSection('parts');
  await checkNoHorizontalOverflow('Parts 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_parts.png` });
  console.log('Saved public_mobile_390_parts.png');

  // 4. Wiring section
  await scrollToSection('wiring');
  await checkNoHorizontalOverflow('Wiring 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_wiring.png` });
  console.log('Saved public_mobile_390_wiring.png');

  // 5. Build steps section
  await scrollToSection('steps');
  await checkNoHorizontalOverflow('Steps 390', 390);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_steps.png` });
  console.log('Saved public_mobile_390_steps.png');

  // 6. Buy Sheet Modal (media_1791876192114_cad8732e.png)
  await page.evaluate(() => {
    const btn = document.getElementById('btn-open-buy-sheet');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_390_buysheet.png` });
  console.log('Saved public_mobile_390_buysheet.png');

  // Close sheet modal
  await page.evaluate(() => {
    const closeBtn = document.getElementById('btn-close-buy-sheet');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // ==========================================
  // VIEWPORT 2: Mobile 360x800 (Compact Android)
  // ==========================================
  const vp360 = { width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await page.setViewport(vp360);

  // Home 360
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Homepage 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_home.png` });
  console.log('Saved public_mobile_360_home.png');

  // Pack 360
  await page.goto(`${BASE}/projects/${SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));
  await checkNoHorizontalOverflow('Pack page 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_pack.png` });
  console.log('Saved public_mobile_360_pack.png');

  // Parts 360
  await scrollToSection('parts');
  await checkNoHorizontalOverflow('Parts 360', 360);
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_mobile_360_parts.png` });
  console.log('Saved public_mobile_360_parts.png');

  // ==========================================
  // VIEWPORT 3: Desktop 1280x900
  // ==========================================
  await page.setViewport({ width: 1280, height: 900 });

  // Home 1280
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_desktop_1280_home.png` });
  console.log('Saved public_desktop_1280_home.png');

  // Pack 1280
  await page.goto(`${BASE}/projects/${SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACT_DIR}/public_desktop_1280_pack.png` });
  console.log('Saved public_desktop_1280_pack.png');

  console.log('All verification screenshots captured successfully!');
} catch (err) {
  console.error('Error during verification:', err);
} finally {
  await browser.close();
}
