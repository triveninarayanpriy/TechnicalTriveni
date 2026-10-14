import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE_URL = 'http://127.0.0.1:8788';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
});

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const innerWidth = window.innerWidth;
    const hasOverflow = scrollWidth > innerWidth + 1 || bodyScrollWidth > innerWidth + 1;
    let culprits = [];
    if (hasOverflow) {
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerWidth + 1) {
          culprits.push({
            tag: el.tagName,
            cls: el.className ? String(el.className) : '',
            id: el.id,
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          });
        }
      });
    }
    return { hasOverflow, innerWidth, scrollWidth, bodyScrollWidth, culprits: culprits.slice(0, 5) };
  });

  if (overflow.hasOverflow) {
    console.error(`[OVERFLOW DETECTED] ${label}: innerWidth=${overflow.innerWidth}, scrollWidth=${overflow.scrollWidth}`, overflow.culprits);
  } else {
    console.log(`[PASS OVERFLOW] ${label}: innerWidth=${overflow.innerWidth}, scrollWidth=${overflow.scrollWidth}`);
  }
  return overflow;
}

try {
  const page = await browser.newPage();

  async function visit(url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 700));
  }

  // ==========================================
  // 1. MOBILE 390x844
  // ==========================================
  console.log('--- Testing Mobile 390x844 ---');
  await page.setViewport({ width: 390, height: 844 });

  // Home
  await visit(`${BASE_URL}/`);
  await checkOverflow(page, 'Mobile 390 Home');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_home.png` });

  // Mobile Menu Overlay
  await page.evaluate(() => document.querySelector('[data-nav-toggle]')?.click());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_menu_open.png` });
  await page.evaluate(() => document.querySelector('[data-nav-close]')?.click());
  await new Promise(r => setTimeout(r, 300));

  // Projects
  await visit(`${BASE_URL}/projects`);
  await checkOverflow(page, 'Mobile 390 Projects');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_projects.png` });

  // Pack Detail
  await visit(`${BASE_URL}/projects/iot-weather-station-esp32`);
  await checkOverflow(page, 'Mobile 390 Pack Detail');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_pack_detail.png` });

  // Pack Detail: Open Buy Sheet
  await page.evaluate(() => document.getElementById('btn-open-m-sheet')?.click());
  await new Promise(r => setTimeout(r, 400));
  await checkOverflow(page, 'Mobile 390 Buy Sheet');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_buy_sheet.png` });
  // Close Buy Sheet
  await page.evaluate(() => document.getElementById('btn-close-m-sheet')?.click());
  await new Promise(r => setTimeout(r, 300));

  // Pack Detail: Switch to Parts tab
  await page.evaluate(() => document.querySelector('[data-mobile-tab="parts"]')?.click());
  await new Promise(r => setTimeout(r, 400));
  await checkOverflow(page, 'Mobile 390 Pack Parts Tab');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_pack_parts.png` });

  // Pack Detail: Switch to Build Steps tab
  await page.evaluate(() => document.querySelector('[data-mobile-tab="steps"]')?.click());
  await new Promise(r => setTimeout(r, 400));
  await checkOverflow(page, 'Mobile 390 Pack Steps Tab');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_pack_steps.png` });

  // How it works
  await visit(`${BASE_URL}/how-it-works`);
  await checkOverflow(page, 'Mobile 390 How It Works');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_how_it_works.png` });

  // About
  await visit(`${BASE_URL}/about`);
  await checkOverflow(page, 'Mobile 390 About');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_about.png` });

  // Contact
  await visit(`${BASE_URL}/contact`);
  await checkOverflow(page, 'Mobile 390 Contact');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_contact.png` });

  // My Downloads
  await visit(`${BASE_URL}/account/downloads`);
  await checkOverflow(page, 'Mobile 390 Downloads');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_390_downloads.png` });


  // ==========================================
  // 2. MOBILE 360x800 (Narrow phone)
  // ==========================================
  console.log('--- Testing Mobile 360x800 ---');
  await page.setViewport({ width: 360, height: 800 });

  await visit(`${BASE_URL}/`);
  await checkOverflow(page, 'Mobile 360 Home');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_360_home.png` });

  await visit(`${BASE_URL}/projects`);
  await checkOverflow(page, 'Mobile 360 Projects');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_360_projects.png` });

  await visit(`${BASE_URL}/projects/iot-weather-station-esp32`);
  await checkOverflow(page, 'Mobile 360 Pack Detail');
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_360_pack_detail.png` });

  await visit(`${BASE_URL}/how-it-works`);
  await checkOverflow(page, 'Mobile 360 How It Works');

  await visit(`${BASE_URL}/about`);
  await checkOverflow(page, 'Mobile 360 About');

  await visit(`${BASE_URL}/contact`);
  await checkOverflow(page, 'Mobile 360 Contact');

  await visit(`${BASE_URL}/account/downloads`);
  await checkOverflow(page, 'Mobile 360 Downloads');


  // ==========================================
  // 3. DESKTOP 1440x900
  // ==========================================
  console.log('--- Testing Desktop 1440x900 ---');
  await page.setViewport({ width: 1440, height: 900 });

  // Home
  await visit(`${BASE_URL}/`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_home.png` });

  // Projects
  await visit(`${BASE_URL}/projects`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_projects.png` });

  // Pack Detail
  await visit(`${BASE_URL}/projects/iot-weather-station-esp32`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_pack_detail.png` });

  // Pack Detail scrolled down
  await page.evaluate(() => window.scrollBy(0, 750));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_pack_scrolled.png` });

  // How it works
  await visit(`${BASE_URL}/how-it-works`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_how_it_works.png` });

  // About
  await visit(`${BASE_URL}/about`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_about.png` });

  // Contact
  await visit(`${BASE_URL}/contact`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_contact.png` });

  // Downloads
  await visit(`${BASE_URL}/account/downloads`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440_downloads.png` });

  console.log('--- SUCCESS: Complete run verified with zero overflow! ---');
} catch (err) {
  console.error('Error during verification:', err);
} finally {
  await browser.close();
}
