import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const results = [];

// 1. Desktop Test (1280px)
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 30000 });

  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const h1Computed = h1 ? window.getComputedStyle(h1) : null;
    const bodyComputed = window.getComputedStyle(document.body);
    const container = document.querySelector('.container');
    const containerComputed = container ? window.getComputedStyle(container) : null;
    const header = document.querySelector('.site-header');
    const headerComputed = header ? window.getComputedStyle(header) : null;
    const cookie = document.querySelector('.cookie');
    const cookieComputed = cookie ? window.getComputedStyle(cookie) : null;
    const footerLogoT1 = document.querySelector('.site-footer .logo__t1');
    const footerLogoT1Computed = footerLogoT1 ? window.getComputedStyle(footerLogoT1) : null;
    const footerChevron = document.querySelector('.footer-chevron');
    const footerChevronComputed = footerChevron ? window.getComputedStyle(footerChevron) : null;
    const btn = document.querySelector('.btn-primary');
    const btnComputed = btn ? window.getComputedStyle(btn) : null;

    return {
      h1FontSize: h1Computed?.fontSize,
      h1FontWeight: h1Computed?.fontWeight,
      bodyFontSize: bodyComputed.fontSize,
      containerPaddingLeft: containerComputed?.paddingLeft,
      containerPaddingRight: containerComputed?.paddingRight,
      containerMaxWidth: containerComputed?.maxWidth,
      headerHeight: headerComputed?.height,
      cookieBottom: cookieComputed?.bottom,
      cookieLeft: cookieComputed?.left,
      cookieMaxWidth: cookieComputed?.maxWidth,
      footerLogoT1Color: footerLogoT1Computed?.color,
      footerChevronDisplay: footerChevronComputed?.display,
      btnHeight: btnComputed?.height
    };
  });

  results.push({ viewport: '1280px', metrics });
  await page.screenshot({ path: `${ARTIFACT_DIR}/r2_desktop_1280px.png`, fullPage: false });
  await page.close();
}

// 2. Mobile Test (360px)
{
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 30000 });

  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const h1Computed = h1 ? window.getComputedStyle(h1) : null;
    const bodyComputed = window.getComputedStyle(document.body);
    const container = document.querySelector('.container');
    const containerComputed = container ? window.getComputedStyle(container) : null;
    const header = document.querySelector('.site-header');
    const headerComputed = header ? window.getComputedStyle(header) : null;
    const cookie = document.querySelector('.cookie');
    const cookieComputed = cookie ? window.getComputedStyle(cookie) : null;
    const footerChevron = document.querySelector('.footer-chevron');
    const footerChevronComputed = footerChevron ? window.getComputedStyle(footerChevron) : null;
    const btn = document.querySelector('.btn-primary');
    const btnComputed = btn ? window.getComputedStyle(btn) : null;

    return {
      h1FontSize: h1Computed?.fontSize,
      h1FontWeight: h1Computed?.fontWeight,
      bodyFontSize: bodyComputed.fontSize,
      containerPaddingLeft: containerComputed?.paddingLeft,
      containerPaddingRight: containerComputed?.paddingRight,
      headerHeight: headerComputed?.height,
      cookieBottom: cookieComputed?.bottom,
      cookieLeft: cookieComputed?.left,
      cookieRight: cookieComputed?.right,
      footerChevronDisplay: footerChevronComputed?.display,
      btnHeight: btnComputed?.height
    };
  });

  results.push({ viewport: '360px', metrics });
  await page.screenshot({ path: `${ARTIFACT_DIR}/r2_mobile_360px.png`, fullPage: false });

  // Test mobile menu sheet open
  await page.click('[data-nav-toggle]');
  await new Promise(r => setTimeout(r, 250));
  const sheetOpen = await page.evaluate(() => {
    const sheet = document.querySelector('[data-mobile-nav]');
    return sheet ? !sheet.hasAttribute('hidden') : false;
  });
  results.push({ mobileSheetOpen: sheetOpen });
  await page.screenshot({ path: `${ARTIFACT_DIR}/r2_mobile_sheet_360px.png`, fullPage: false });

  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
