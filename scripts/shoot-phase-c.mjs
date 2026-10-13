import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE = 'http://127.0.0.1:8788';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();

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

  console.log('Logged in successfully. Navigating to project 1 editor...');

  // 2. Open Project 1 Editor
  await page.goto(`${BASE}/admin/projects/1`, { waitUntil: 'domcontentloaded' });

  // 3. Switch to Troubleshooting tab
  await page.click('button[data-tab="troubleshooting"]');
  await new Promise(r => setTimeout(r, 400));

  // Expand the second tip (which has a Cause)
  await page.$$eval('details.data-row-edit', els => {
    if (els.length > 1) els[1].open = true;
  });
  await new Promise(r => setTimeout(r, 200));

  // Scroll Troubleshooting panel into view
  await page.$eval('section[data-panel="troubleshooting"]', el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await new Promise(r => setTimeout(r, 300));

  // Screenshot 1: Desktop Admin Troubleshooting Tab
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_c_desktop_troubleshooting_admin.png`, fullPage: false });
  console.log('Saved phase_c_desktop_troubleshooting_admin.png');

  // 4. Mobile 360px Viewport for Admin
  await page.setViewport({ width: 360, height: 740, isMobile: true, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.click('button[data-tab="troubleshooting"]');
  await new Promise(r => setTimeout(r, 400));
  await page.$$eval('details.data-row-edit', els => {
    if (els.length > 1) els[1].open = true;
  });
  await new Promise(r => setTimeout(r, 200));
  await page.$eval('section[data-panel="troubleshooting"]', el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_c_mobile_troubleshooting_admin.png`, fullPage: false });
  console.log('Saved phase_c_mobile_troubleshooting_admin.png');

  // 5. Public Site View at 1280px Viewport
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/projects/iot-weather-station-esp32`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  const troubleSec = await page.$('#troubleshooting');
  if (troubleSec) {
    // Open all public details items so Fix and Cause are visible
    await page.$$eval('#troubleshooting details', els => els.forEach(el => el.open = true));
    await new Promise(r => setTimeout(r, 300));
    await page.$eval('#troubleshooting', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: `${ARTIFACT_DIR}/phase_c_desktop_public_troubleshooting.png`, fullPage: false });
    console.log('Saved phase_c_desktop_public_troubleshooting.png');
  } else {
    console.log('Warning: #troubleshooting section not found on public page');
  }

  // 6. Public Site View at 360px Viewport
  await page.setViewport({ width: 360, height: 740, isMobile: true, deviceScaleFactor: 2 });
  if (troubleSec) {
    await page.$eval('#troubleshooting', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: `${ARTIFACT_DIR}/phase_c_mobile_public_troubleshooting.png`, fullPage: false });
    console.log('Saved phase_c_mobile_public_troubleshooting.png');
  }

  console.log('Phase C verification complete!');
} catch (err) {
  console.error('Test error:', err);
  process.exit(1);
} finally {
  await browser.close();
}
