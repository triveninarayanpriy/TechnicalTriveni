import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const AFTER_DIR = path.join(ARTIFACT_DIR, 'after_smart_scale');
if (!fs.existsSync(AFTER_DIR)) {
  fs.mkdirSync(AFTER_DIR, { recursive: true });
}

const BASE_URL = 'http://127.0.0.1:8788';

const VIEWPORTS = [
  { name: 'phone-small', w: 360, h: 800, tier: 'phone' },
  { name: 'phone-iphone', w: 390, h: 844, tier: 'phone' },
  { name: 'phone-pixel', w: 412, h: 915, tier: 'phone' },
  { name: 'tablet-ipad', w: 768, h: 1024, tier: 'tablet' },
  { name: 'tablet-air', w: 820, h: 1180, tier: 'tablet' },
  { name: 'laptop-small', w: 1024, h: 768, tier: 'laptop' },
  { name: 'laptop-hd', w: 1280, h: 720, tier: 'laptop' },
  { name: 'laptop-short', w: 1354, h: 560, tier: 'laptop' },
  { name: 'laptop-common', w: 1366, h: 768, tier: 'laptop' },
  { name: 'desktop-mac', w: 1440, h: 900, tier: 'desktop' },
  { name: 'desktop-mid', w: 1536, h: 864, tier: 'desktop' },
  { name: 'desktop-hdplus', w: 1600, h: 900, tier: 'desktop' },
  { name: 'desktop-fhd', w: 1920, h: 1080, tier: 'large' },
  { name: 'desktop-2k', w: 2560, h: 1440, tier: 'ultra-wide/4K' },
  { name: 'ultrawide', w: 3440, h: 1440, tier: 'ultra-wide/4K' },
  { name: 'desktop-4k', w: 3840, h: 2160, tier: 'ultra-wide/4K' },
];

async function run() {
  console.log('🚀 Starting Smart Scaling Verification Suite...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const matrixResults = [];
  const zoomResults = [];
  const assertionErrors = [];

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    // -------------------------------------------------------------
    // Test 1: 16 Viewports Matrix on Home page
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing 16 Viewports ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.w, height: vp.h });
      await page.goto(`${BASE_URL}/?debug=layout`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));

      const evaluation = await page.evaluate((vp) => {
        const doc = document.documentElement;
        const clientWidth = doc.clientWidth;
        const scrollWidth = doc.scrollWidth;
        const rootFsStr = window.getComputedStyle(doc).fontSize;
        const rootFs = parseFloat(rootFsStr) || 16;
        const scalePct = Math.round((rootFs / 16) * 100);

        // Body text computed size
        const bodyFsStr = window.getComputedStyle(document.body).fontSize;
        const bodyFs = parseFloat(bodyFsStr) || 16;

        // Header check
        const navDesktop = document.querySelector('.nav-desktop');
        const searchPill = document.querySelector('.desktop-search-pill');
        const downloads = document.querySelector('.nav-link--downloads');
        const freeBtn = document.querySelector('.btn--header');
        const mobileToggle = document.querySelector('[data-nav-toggle]');
        const isDesktopHeader = vp.w >= 1024;

        const headerOk = isDesktopHeader
          ? (navDesktop && window.getComputedStyle(navDesktop).display !== 'none' &&
             searchPill && window.getComputedStyle(searchPill).display !== 'none')
          : (mobileToggle && window.getComputedStyle(mobileToggle).display !== 'none');

        // Debug badge check
        const badge = document.getElementById('tt-debug-layout-badge');
        const badgeVisible = badge && !badge.hidden && window.getComputedStyle(badge).display !== 'none';

        // Check if hero buttons & featured packs heading are in initial view on 1366x768
        let heroButtonsVisible = null;
        let featuredHeadingVisible = null;
        if (vp.w === 1366 && vp.h === 768) {
          const heroBtns = document.querySelector('.home-hero__buttons');
          const featHead = document.querySelector('.featured-head-row h2, .section-heading');
          if (heroBtns) {
            const r = heroBtns.getBoundingClientRect();
            heroButtonsVisible = r.bottom <= vp.h;
          }
          if (featHead) {
            const r = featHead.getBoundingClientRect();
            featuredHeadingVisible = r.top <= vp.h;
          }
        }

        // Horizontal overflow check
        const hasOverflow = scrollWidth > clientWidth + 1; // 1px rounding tolerance

        return {
          clientWidth,
          scrollWidth,
          hasOverflow,
          rootFs: rootFs.toFixed(2),
          scalePct,
          bodyFs: bodyFs.toFixed(2),
          headerOk,
          badgeVisible,
          heroButtonsVisible,
          featuredHeadingVisible,
        };
      }, vp);

      matrixResults.push({
        name: vp.name,
        width: vp.w,
        height: vp.h,
        tier: vp.tier,
        ...evaluation
      });

      console.log(`[${vp.w}x${vp.h}] ${vp.name.padEnd(14)}: root=${evaluation.rootFs}px (${evaluation.scalePct}%), body=${evaluation.bodyFs}px, overflow=${evaluation.hasOverflow}, headerOk=${evaluation.headerOk}`);

      if (evaluation.hasOverflow) {
        assertionErrors.push(`Viewport ${vp.w}x${vp.h} has horizontal overflow (scrollW=${evaluation.scrollWidth}, clientW=${evaluation.clientWidth})`);
      }
      if (!evaluation.headerOk) {
        assertionErrors.push(`Viewport ${vp.w}x${vp.h} header state mismatch`);
      }
      if (!evaluation.badgeVisible) {
        assertionErrors.push(`Viewport ${vp.w}x${vp.h} debug badge missing when ?debug=layout passed`);
      }
    }

    // -------------------------------------------------------------
    // Test 2: Debug Badge hidden without ?debug=layout
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Debug Badge invisibility without query param ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const badgeHidden = await page.evaluate(() => {
      const b = document.getElementById('tt-debug-layout-badge');
      return !b || b.hidden || window.getComputedStyle(b).display === 'none';
    });
    console.log(`Debug badge hidden on clean URL: ${badgeHidden}`);
    if (!badgeHidden) assertionErrors.push('Debug badge is unexpectedly visible without ?debug=layout query param');

    // -------------------------------------------------------------
    // Test 3: Cookie Banner clearance (never covers footer last line)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Cookie Banner clearance ---');
    await page.setViewport({ width: 1440, height: 900 });
    // Clear acknowledged cookie flag so banner displays
    await page.evaluate(() => localStorage.removeItem('tt-cookie-ack'));
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const cookieClearance = await page.evaluate(() => {
      const banner = document.getElementById('cookie-banner');
      const bodyPaddingBottom = parseFloat(window.getComputedStyle(document.body).paddingBottom) || 0;
      const bannerHeight = banner ? banner.offsetHeight : 0;
      const bannerVisible = banner && !banner.hidden;

      return {
        bannerVisible,
        bannerHeight,
        bodyPaddingBottom,
        protected: bodyPaddingBottom >= bannerHeight
      };
    });
    console.log(`Cookie banner: visible=${cookieClearance.bannerVisible}, height=${cookieClearance.bannerHeight}px, bodyPaddingBottom=${cookieClearance.bodyPaddingBottom}px, protected=${cookieClearance.protected}`);
    if (!cookieClearance.protected) {
      assertionErrors.push(`Body padding bottom (${cookieClearance.bodyPaddingBottom}px) is less than banner height (${cookieClearance.bannerHeight}px)`);
    }

    // -------------------------------------------------------------
    // Test 4: Zoom levels (80%, 100%, 125%) at 1366x768 and 1920x1080
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Zoom levels (80%, 100%, 125%) ---');
    const client = await page.target().createCDPSession();

    for (const [w, h] of [[1366, 768], [1920, 1080]]) {
      await page.setViewport({ width: w, height: h });
      for (const zoom of [0.8, 1.0, 1.25]) {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
        await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: zoom });
        await new Promise(r => setTimeout(r, 400));

        const zRes = await page.evaluate(() => {
          const doc = document.documentElement;
          return {
            clientWidth: doc.clientWidth,
            scrollWidth: doc.scrollWidth,
            hasOverflow: doc.scrollWidth > doc.clientWidth + 1
          };
        });

        zoomResults.push({ w, h, zoom: `${Math.round(zoom * 100)}%`, ...zRes });
        console.log(`[${w}x${h}] Zoom ${Math.round(zoom * 100)}%: clientW=${zRes.clientWidth}, scrollW=${zRes.scrollWidth}, overflow=${zRes.hasOverflow}`);
        if (zRes.hasOverflow) {
          assertionErrors.push(`[${w}x${h}] Zoom ${Math.round(zoom * 100)}% produced horizontal overflow`);
        }
      }
    }
    // Reset scale
    await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.0 });

    // -------------------------------------------------------------
    // Test 5: Capture AFTER screenshots for visual comparison
    // -------------------------------------------------------------
    console.log('\n--- 5. Capturing After Screenshots (1354, 1600, 1912) ---');
    const captureList = [
      { w: 1354, h: 560, file: 'after_home_1354px.png' },
      { w: 1600, h: 900, file: 'after_home_1600px.png' },
      { w: 1912, h: 1080, file: 'after_home_1912px.png' },
      { w: 1366, h: 768, file: 'after_home_1366x768.png' },
      { w: 1440, h: 900, file: 'after_projects_1440px.png', url: '/projects' },
      { w: 1440, h: 900, file: 'after_pack_1440px.png', url: '/projects/arduino-drone' },
    ];

    for (const item of captureList) {
      await page.setViewport({ width: item.w, height: item.h });
      await page.goto(`${BASE_URL}${item.url || '/'}?debug=layout`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const targetPath = path.join(AFTER_DIR, item.file);
      await page.screenshot({ path: targetPath, fullPage: false });
      console.log(`Saved screenshot: ${item.file}`);
    }

    // -------------------------------------------------------------
    // Test 6: Verify Readability Floors
    // -------------------------------------------------------------
    console.log('\n--- 6. Checking Readability Floors ---');
    await page.setViewport({ width: 1024, height: 768 }); // minimum desktop root (12.8px)
    await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle2' });
    const floors = await page.evaluate(() => {
      const body = parseFloat(window.getComputedStyle(document.body).fontSize);
      const chip = document.querySelector('.seg-item, .chip, .cat-chip');
      const chipFs = chip ? parseFloat(window.getComputedStyle(chip).fontSize) : null;
      const subtitle = document.querySelector('.projects-main-subtitle');
      const subtitleFs = subtitle ? parseFloat(window.getComputedStyle(subtitle).fontSize) : null;

      return {
        body,
        chipFs,
        subtitleFs,
        bodyOk: body >= 14,
        chipOk: chipFs ? chipFs >= 12 : true,
      };
    });
    console.log(`Readability floors at 1024x768: body=${floors.body}px (>=14: ${floors.bodyOk}), chip=${floors.chipFs}px (>=12: ${floors.chipOk})`);

    // Write results summary
    const summaryData = {
      timestamp: new Date().toISOString(),
      matrixResults,
      zoomResults,
      cookieClearance,
      floors,
      assertionErrors,
      passed: assertionErrors.length === 0
    };

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'smart_scale_results.json'),
      JSON.stringify(summaryData, null, 2)
    );

    console.log('\n=======================================');
    if (assertionErrors.length === 0) {
      console.log('✅ ALL SMART SCALING ASSERTIONS PASSED!');
    } else {
      console.log(`❌ ENCOUNTERED ${assertionErrors.length} ERRORS:`);
      assertionErrors.forEach(e => console.log('  - ' + e));
    }
    console.log('=======================================');

  } finally {
    await browser.close();
  }
}

run().catch(e => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
