import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const LIVE_URL = 'https://technical-triveni.innovationhubnitp.workers.dev';

async function run() {
  console.log('Starting Home Redesign Live Smoke Tests...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('tt-cookie-ack', '1');
    } catch {}
  });

  const viewports = [
    { name: '390', width: 390, height: 844, isMobile: true },
    { name: '768', width: 768, height: 1024, isMobile: true },
    { name: '1366', width: 1366, height: 768, isMobile: false },
    { name: '1440', width: 1440, height: 900, isMobile: false },
    { name: '1920', width: 1920, height: 1080, isMobile: false },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await page.goto(LIVE_URL + '/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const b = document.querySelector('.cookie-banner, [data-cookie-banner]');
      if (b) b.remove();
    });
    const shotPath = path.join(ARTIFACT_DIR, `home_live_${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`Saved screenshot for ${vp.name}px`);
  }

  // Test tabs filtering on 1440px
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(LIVE_URL + '/', { waitUntil: 'networkidle2' });

  // Click 'Free' tab
  const freeBtn = await page.waitForSelector('[data-home-tab="free"]');
  await freeBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  const freeVisible = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.pack-card-item'));
    return {
      total: cards.length,
      visible: cards.filter((c) => c.style.display !== 'none').length,
      types: cards.filter((c) => c.style.display !== 'none').map((c) => c.dataset.priceType),
    };
  });
  console.log('Free filter result:', freeVisible);

  // Click 'Paid' tab
  const paidBtn = await page.waitForSelector('[data-home-tab="paid"]');
  await paidBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  const paidVisible = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.pack-card-item'));
    return {
      total: cards.length,
      visible: cards.filter((c) => c.style.display !== 'none').length,
      types: cards.filter((c) => c.style.display !== 'none').map((c) => c.dataset.priceType),
    };
  });
  console.log('Paid filter result:', paidVisible);

  // Click 'All' tab
  const allBtn = await page.waitForSelector('[data-home-tab="all"]');
  await allBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  const allVisible = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.pack-card-item'));
    return {
      total: cards.length,
      visible: cards.filter((c) => c.style.display !== 'none').length,
    };
  });
  console.log('All filter result:', allVisible);

  await browser.close();
  console.log('ALL SMOKE TESTS COMPLETED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Smoke test error:', err);
  process.exit(1);
});
