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

  // 3. Switch to Parts (BOM) tab
  await page.click('button[data-tab="parts"]');
  await new Promise(r => setTimeout(r, 300));

  // 4. Test reorder buttons exist on BOM rows
  const reorderBtns = await page.$$('.bom-reorder-btn');
  console.log(`Found ${reorderBtns.length} BOM row reorder buttons.`);

  // Scroll Add a Component into view
  await page.$eval('.bom-add-container', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await new Promise(r => setTimeout(r, 200));

  // Screenshot 1: Desktop Default BOM "Add a Part" view (clean typeahead search box + secondary link only)
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_desktop_bom_default.png`, fullPage: false });
  console.log('Saved phase_b_desktop_bom_default.png');

  // 5. Test Type-Ahead Search against component library
  await page.click('#bom-typeahead-input');
  await page.type('#bom-typeahead-input', 'Motor');
  await new Promise(r => setTimeout(r, 400));

  // Screenshot 2: Typeahead search dropdown matches
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_desktop_typeahead_search.png`, fullPage: false });
  console.log('Saved phase_b_desktop_typeahead_search.png');

  // 6. Select a match from dropdown
  const firstItem = await page.$('.typeahead-item');
  if (firstItem) {
    await firstItem.click();
    await new Promise(r => setTimeout(r, 300));
    // Screenshot 3: Selected preview card
    await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_desktop_selected_card.png`, fullPage: false });
    console.log('Saved phase_b_desktop_selected_card.png');
  }

  // 7. Click "+ Add a brand-new custom component instead"
  await page.click('#toggle-custom-comp-btn');
  await new Promise(r => setTimeout(r, 300));
  await page.$eval('#bom-custom-add-form', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  // Screenshot 4: Custom component 8-field form revealed
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_desktop_custom_form.png`, fullPage: false });
  console.log('Saved phase_b_desktop_custom_form.png');

  // 8. Mobile 360px viewport test
  await page.setViewport({ width: 360, height: 740, isMobile: true, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click('button[data-tab="parts"]');
  await new Promise(r => setTimeout(r, 300));

  await page.$eval('.bom-add-container', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_mobile_bom_default.png`, fullPage: false });
  console.log('Saved phase_b_mobile_bom_default.png');

  await page.click('#bom-typeahead-input');
  await page.type('#bom-typeahead-input', 'ESP');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_mobile_bom_typeahead.png`, fullPage: false });
  console.log('Saved phase_b_mobile_bom_typeahead.png');

  const mobileFirstItem = await page.$('.typeahead-item');
  if (mobileFirstItem) {
    await mobileFirstItem.click();
    await new Promise(r => setTimeout(r, 300));
    await page.$eval('#typeahead-selected-card', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_mobile_bom_selected.png`, fullPage: false });
    console.log('Saved phase_b_mobile_bom_selected.png');
  }

  await page.click('#toggle-custom-comp-btn');
  await new Promise(r => setTimeout(r, 300));
  await page.$eval('#bom-custom-add-form', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.screenshot({ path: `${ARTIFACT_DIR}/phase_b_mobile_custom_form.png`, fullPage: false });
  console.log('Saved phase_b_mobile_custom_form.png');

  console.log('Phase B verification complete!');
} catch (err) {
  console.error('Test error:', err);
  process.exit(1);
} finally {
  await browser.close();
}
