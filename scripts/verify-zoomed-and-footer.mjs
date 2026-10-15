import puppeteer from 'puppeteer';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('Testing zoomed root font sizes and footer clearance...');

  for (const [w, h] of [
    [1024, 768],
    [1280, 720],
    [1354, 560],
    [1366, 768],
    [1440, 900],
    [1600, 900],
    [1920, 1080]
  ]) {
    await page.setViewport({ width: w, height: h });
    await page.goto(`${BASE_URL}/?debug=layout`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const footer = document.querySelector('.site-footer');
      const rootFs = parseFloat(window.getComputedStyle(doc).fontSize);
      const scalePct = Math.round((rootFs / 16) * 100);
      const bodyPaddingBottom = window.getComputedStyle(body).paddingBottom;
      const cookieBannerH = window.getComputedStyle(doc).getPropertyValue('--cookie-banner-h');
      
      const bodyH = body.offsetHeight;
      const footerBottom = footer ? footer.getBoundingClientRect().bottom + window.scrollY : null;
      const whiteGapBelowFooter = footerBottom ? Math.round(bodyH - footerBottom) : 0;

      // Header check
      const navDesktop = document.querySelector('.nav-desktop');
      const searchPill = document.querySelector('.desktop-search-pill');
      const downloads = document.querySelector('.nav-link--downloads');
      const freeBtn = document.querySelector('.btn--header');

      return {
        rootFs,
        scalePct,
        bodyPaddingBottom,
        cookieBannerH,
        bodyH,
        footerBottom,
        whiteGapBelowFooter,
        hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
        headerDesktopVisible: navDesktop && window.getComputedStyle(navDesktop).display !== 'none',
      };
    });

    console.log(`[${w}x${h}]: root=${data.rootFs}px (${data.scalePct}%), bodyPB=${data.bodyPaddingBottom}, gapBelowFooter=${data.whiteGapBelowFooter}px, overflow=${data.hasOverflow}, headerDesk=${data.headerDesktopVisible}`);
  }

  // Scroll to bottom and take screenshot of the footer
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'footer_bottom_fixed.png'),
    fullPage: false
  });
  console.log('Saved footer_bottom_fixed.png');

  await browser.close();
}

main().catch(console.error);
