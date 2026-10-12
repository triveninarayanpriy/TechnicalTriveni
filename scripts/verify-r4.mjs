import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const report = {};

try {
  // 1. DRONE PROJECT (PAID, HARDWARE) - Desktop 1280px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/projects/arduino-drone`, { waitUntil: 'networkidle0', timeout: 30000 });

    const droneDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.p-title');
      const buyBox = document.querySelector('#main-buy-box');
      const price = buyBox?.querySelector('.buy-box__price')?.textContent.trim();
      const buyBtn = buyBox?.querySelector('#btn-buy-submit')?.textContent.trim();
      const badges = Array.from(document.querySelectorAll('.p-badge')).map(b => b.textContent.trim());
      const secLinks = Array.from(document.querySelectorAll('.p-secnav__link')).map(a => a.textContent.trim());
      const hasBom = !!document.querySelector('#parts .bom-table');
      const bomTotal = document.querySelector('#bom-calc-total')?.textContent.trim();
      const hasWiring = !!document.querySelector('#wiring .p-table');
      const hasSteps = !!document.querySelector('#steps .p-step-card');
      const authorTitle = document.querySelector('.p-author-title')?.textContent.trim();

      return {
        h1Text: h1?.textContent.trim(),
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        price,
        buyBtn,
        badges,
        secLinks,
        hasBom,
        bomTotal,
        hasWiring,
        hasSteps,
        authorTitle,
      };
    });

    report.droneDesktop = droneDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r4_drone_desktop_1280px.png`, fullPage: false });
    await page.close();
  }

  // 2. DRONE PROJECT - Mobile 360px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/projects/arduino-drone`, { waitUntil: 'networkidle0', timeout: 30000 });

    const droneMobile = await page.evaluate(() => {
      const h1 = document.querySelector('.p-title');
      const stickyBar = document.querySelector('#mobile-sticky-bar');
      const stage = document.querySelector('#media-stage');

      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        stageWidth: stage ? stage.getBoundingClientRect().width : null,
        stickyBarHeight: stickyBar ? window.getComputedStyle(stickyBar).height : null,
      };
    });

    report.droneMobile = droneMobile;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r4_drone_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 3. FREE COMPONENTS GUIDE - Desktop 1280px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/projects/100-electronics-components`, { waitUntil: 'networkidle0', timeout: 30000 });

    const freeDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.p-title');
      const buyBox = document.querySelector('#main-buy-box');
      const freeTag = buyBox?.querySelector('.buy-box__tag--free')?.textContent.trim();
      const freeBtn = buyBox?.querySelector('#btn-free-submit')?.textContent.trim();
      const hasAnyPrice = buyBox?.textContent.includes('₹');
      const badges = Array.from(document.querySelectorAll('.p-badge')).map(b => b.textContent.trim());

      return {
        h1Text: h1?.textContent.trim(),
        freeTag,
        freeBtn,
        hasAnyPrice,
        badges,
      };
    });

    report.freeComponentsDesktop = freeDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r4_free_components_desktop_1280px.png`, fullPage: false });
    await page.close();
  }

  // 4. FREE COMPONENTS GUIDE - Mobile 360px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/projects/100-electronics-components`, { waitUntil: 'networkidle0', timeout: 30000 });

    const freeMobile = await page.evaluate(() => {
      const h1 = document.querySelector('.p-title');
      const freeBtn = document.querySelector('#btn-free-submit')?.textContent.trim();
      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        freeBtn
      };
    });

    report.freeComponentsMobile = freeMobile;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r4_free_components_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 5. ROBOT PROJECT (PAID, TROUBLESHOOTING) - Desktop 1280px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/projects/line-following-robot-arduino`, { waitUntil: 'networkidle0', timeout: 30000 });

    const robotDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.p-title');
      const hasTrouble = !!document.querySelector('#troubleshooting .trouble-table');
      const price = document.querySelector('.buy-box__price')?.textContent.trim();
      return {
        h1Text: h1?.textContent.trim(),
        hasTrouble,
        price,
      };
    });

    report.robotDesktop = robotDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r4_robot_desktop_1280px.png`, fullPage: false });
    await page.close();
  }

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
