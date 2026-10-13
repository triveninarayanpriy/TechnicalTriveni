import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE = 'http://127.0.0.1:8788';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();

try {
  // 1. Log in
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle0' });
  
  await page.type('#email', 'admin@technicaltriveni.com');
  await page.type('#password', 'triveni-admin-2026');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);

  console.log('Logged in successfully. Navigating to project 1...');

  // 2. Open Project 1 Editor
  await page.goto(`${BASE}/admin/projects/1`, { waitUntil: 'networkidle0' });

  // Desktop - Tab 1: Basics
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab1_basics.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab1_basics.png');

  // Desktop - Tab 2: Content
  await page.click('button[data-tab="content"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab2_content.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab2_content.png');

  // Desktop - Tab 3: Safety & Credits (with closed-by-default accordion)
  await page.click('button[data-tab="safety"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab3_safety.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab3_safety.png');

  // Desktop - Tab 4: Media
  await page.click('button[data-tab="media"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab4_media.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab4_media.png');

  // Desktop - Tab 5: Parts (BOM) [fully expanded]
  await page.click('button[data-tab="parts"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab5_parts.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab5_parts.png');

  // Desktop - Tab 6: Wiring [fully expanded]
  await page.click('button[data-tab="wiring"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab6_wiring.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab6_wiring.png');

  // Desktop - Tab 7: Build Steps [fully expanded]
  await page.click('button[data-tab="steps"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab7_steps.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab7_steps.png');

  // Desktop - Tab 8: Troubleshooting
  await page.click('button[data-tab="troubleshooting"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab8_troubleshooting.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab8_troubleshooting.png');

  // Desktop - Tab 9: Files & Pricing (with closed-by-default accordion)
  await page.click('button[data-tab="files"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab9_files.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab9_files.png');

  // Desktop - Tab 10: SEO (with closed-by-default accordion)
  await page.click('button[data-tab="seo"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_tab10_seo.png`, fullPage: false });
  console.log('Saved phase_a_desktop_tab10_seo.png');

  // Mobile 360px viewport test
  await page.setViewport({ width: 360, height: 740, isMobile: true, deviceScaleFactor: 2 });
  await page.click('button[data-tab="basics"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_mobile_basics.png`, fullPage: false });
  console.log('Saved phase_a_mobile_basics.png');

  await page.click('button[data-tab="parts"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_mobile_parts.png`, fullPage: false });
  console.log('Saved phase_a_mobile_parts.png');

  // New Project page test
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/admin/projects/new`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_a_desktop_new_project.png`, fullPage: false });
  console.log('Saved phase_a_desktop_new_project.png');

  console.log('ALL PHASE A SCREENSHOTS CAPTURED SUCCESSFULLY!');
} catch (err) {
  console.error('Test error:', err);
  process.exit(1);
} finally {
  await browser.close();
}
