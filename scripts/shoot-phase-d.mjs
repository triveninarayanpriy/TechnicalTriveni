import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE = 'http://127.0.0.1:8788';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

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

  console.log('Logged in successfully.');

  // ==========================================
  // SCREENSHOT 1: Admin Settings > Integrations Tab (Gemini Card)
  // ==========================================
  await page.goto(`${BASE}/admin/settings#integrations`, { waitUntil: 'domcontentloaded' });
  await page.click('button[data-tab="integrations"]');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_d_settings_gemini.png`, fullPage: false });
  console.log('Saved phase_d_settings_gemini.png');

  // ==========================================
  // SCREENSHOT 2: New Project > "Draft from Notes" with Gemini
  // ==========================================
  await page.goto(`${BASE}/admin/projects/new`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));

  const notesText = `Dual-axis solar tracker based on ESP32 microcontroller. Uses 4 LDR light dependent resistors arranged in a cross partition to track the sun trajectory, and two MG996R metal gear servos for azimuth and elevation movements. System is powered by a 12V 2A DC power supply stepped down to 5V using an LM2596 buck converter to supply the high-torque servos. Includes a 16x2 I2C character LCD displaying real-time tracking angles and lux readings.
Error encountered during prototyping: ESP32 brownout reset loop occurred when servos engaged simultaneously due to inrush current surpassing 1.5A. Fix: Added a 1000uF electrolytic capacitor across the 5V servo power rail and tied GNDs together.`;

  await page.type('#ai-notes-input', notesText);
  console.log('Pasted rough notes into Draft from Notes textarea.');

  // Click Generate Draft
  await page.click('#ai-generate-notes-btn');
  console.log('Clicked Generate Draft, waiting for Gemini response...');

  // Wait for draft population (up to 15 seconds)
  await page.waitForFunction(() => {
    const title = document.getElementById('title');
    return title && title.value.length > 5;
  }, { timeout: 15000 });

  await new Promise(r => setTimeout(r, 600));

  // Take screenshot of Desktop Draft Notes populated fields
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_d_desktop_draft_notes.png`, fullPage: false });
  console.log('Saved phase_d_desktop_draft_notes.png');

  // ==========================================
  // SCREENSHOT 3: Mobile 360px View of Draft Notes & Form
  // ==========================================
  await page.setViewport({ width: 360, height: 740, isMobile: true, deviceScaleFactor: 2 });
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_d_mobile_draft_notes.png`, fullPage: false });
  console.log('Saved phase_d_mobile_draft_notes.png');

  // ==========================================
  // SCREENSHOT 4: Desktop Per-Tab AI Fill (Parts & Suggestions)
  // ==========================================
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/admin/projects/1`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));

  // Switch to Parts tab
  await page.click('button[data-tab="parts"]');
  await new Promise(r => setTimeout(r, 300));

  // Click "Suggest Parts with AI"
  await page.click('button[data-ai-tab="parts"]');
  await new Promise(r => setTimeout(r, 300));

  // Click "Suggest Components" in prompt box
  await page.click('.ai-run-gen-btn');
  console.log('Generating AI Parts suggestions...');

  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('.ai-suggestion-card');
    return cards && cards.length > 0;
  }, { timeout: 15000 });

  await new Promise(r => setTimeout(r, 400));

  // Click "Fill in Form" on the first suggested part
  await page.click('.ai-use-part-btn');
  await new Promise(r => setTimeout(r, 400));

  // Scroll to custom BOM form to show populated fields and badge
  await page.$eval('#bom-custom-add-form', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_d_desktop_ai_suggestions.png`, fullPage: false });
  console.log('Saved phase_d_desktop_ai_suggestions.png');

  // Also test SEO AI drafting
  await page.click('button[data-tab="seo"]');
  await new Promise(r => setTimeout(r, 300));
  await page.click('button[data-ai-tab="seo"]');
  console.log('Drafting SEO with AI...');
  await page.waitForFunction(() => {
    const metaTitle = document.getElementById('meta_title');
    return metaTitle && metaTitle.value.length > 5;
  }, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));

  console.log('All Phase D Puppeteer tests passed successfully!');
} catch (err) {
  console.error('Puppeteer error:', err);
  process.exit(1);
} finally {
  await browser.close();
}
