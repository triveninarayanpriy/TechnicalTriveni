import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const report = {
  routes: {},
  redirects: {},
  filters: {},
  singlePriceModel: {},
  a11yAndTouchTargets: {},
  horizontalOverflow: {},
  forbiddenTerms: {},
};

try {
  const routesToTest = [
    { name: 'home', path: '/' },
    { name: 'projects_all', path: '/projects' },
    { name: 'projects_free', path: '/projects?price=free' },
    { name: 'projects_paid', path: '/projects?price=paid' },
    { name: 'drone_paid', path: '/projects/arduino-drone' },
    { name: 'components_free', path: '/projects/100-electronics-components' },
    { name: 'robot_paid', path: '/projects/line-following-robot-arduino' },
    { name: 'how_it_works', path: '/how-it-works' },
    { name: 'my_downloads', path: '/account/downloads' },
    { name: 'about', path: '/about' },
    { name: 'contact', path: '/contact' },
    { name: 'terms', path: '/legal/terms' },
    { name: 'privacy', path: '/legal/privacy' },
    { name: 'refund', path: '/legal/refund' },
    { name: 'cookies', path: '/legal/cookies' },
    { name: 'disclaimer', path: '/legal/disclaimer' },
    { name: 'affiliate', path: '/legal/affiliate' },
    { name: 'digital_delivery', path: '/legal/digital-delivery' },
  ];

  // 1. TEST 301 REDIRECTS
  {
    const oldDroneUrl = `${BASE}/projects/diy-arduino-drone-nrf24-remote-receiver-flight-controller-bring-up-wiring-test-c`;
    const res = await fetch(oldDroneUrl, { redirect: 'manual' });
    report.redirects.oldDroneUrl = {
      status: res.status,
      location: res.headers.get('location'),
      is301ToCleanUrl: res.status === 301 && res.headers.get('location') === '/projects/arduino-drone',
    };
  }

  // 2. DESKTOP & MOBILE AUDIT ON EVERY ROUTE
  for (const route of routesToTest) {
    const page = await browser.newPage();
    try {
      // Desktop Test (1280px)
      await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
      const res = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
      const status = res.status();

      const desktopData = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const text = document.body.innerText.toLowerCase();
        const hasCombo = text.includes('project combo') || text.includes('combo pack') || text.includes('combo files') || text.includes('paid combo');
        const hasPurchases = text.includes('my purchases');
        return {
          h1Text: h1?.textContent.trim(),
          h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
          hasCombo,
          hasPurchases,
        };
      });

      // Mobile Test (360px)
      await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
      await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });

      const mobileData = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const isOverflowing = scrollWidth > 360 || bodyWidth > 360;

        // Check button & input touch targets
        const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"], input.input, select'));
        const smallTargets = buttons
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.height > 0 && rect.height < 40 && !el.closest('footer');
          })
          .map((el) => el.textContent?.trim() || el.getAttribute('name') || el.className);

        return {
          h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
          isOverflowing,
          scrollWidth,
          smallTargets,
        };
      });

      report.routes[route.name] = {
        path: route.path,
        status,
        h1Desktop: desktopData.h1FontSize,
        h1Mobile: mobileData.h1FontSize,
        overflowOnMobile: mobileData.isOverflowing,
        scrollWidthMobile: mobileData.scrollWidth,
        forbiddenTerms: {
          hasCombo: desktopData.hasCombo,
          hasPurchases: desktopData.hasPurchases,
        },
        touchTargetViolations: mobileData.smallTargets,
      };
    } finally {
      await page.close();
    }
  }

  // 3. CATALOG FILTER TEST
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    
    // Free filter
    await page.goto(`${BASE}/projects?price=free`, { waitUntil: 'networkidle0' });
    const freeCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.pcard'));
      return cards.map(c => ({
        title: c.querySelector('.pcard__title')?.textContent.trim(),
        priceTag: c.querySelector('.pcard__price, .pcard__price--free')?.textContent.trim(),
      }));
    });
    report.filters.freeFilter = {
      count: freeCards.length,
      allFree: freeCards.every(c => c.priceTag?.toLowerCase().includes('free')),
      cards: freeCards,
    };

    // Paid filter
    await page.goto(`${BASE}/projects?price=paid`, { waitUntil: 'networkidle0' });
    const paidCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.pcard'));
      return cards.map(c => ({
        title: c.querySelector('.pcard__title')?.textContent.trim(),
        priceTag: c.querySelector('.pcard__price')?.textContent.trim(),
      }));
    });
    report.filters.paidFilter = {
      count: paidCards.length,
      allPaid: paidCards.every(c => c.priceTag?.includes('₹')),
      cards: paidCards,
    };

    await page.close();
  }

  // 4. SCREENSHOTS FOR FINAL ARTIFACT
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `${ARTIFACT_DIR}/r6_final_home_desktop.png` });

    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `${ARTIFACT_DIR}/r6_final_home_mobile.png` });

    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`${BASE}/projects/arduino-drone`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `${ARTIFACT_DIR}/r6_final_project_desktop.png` });

    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/projects/arduino-drone`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `${ARTIFACT_DIR}/r6_final_project_mobile.png` });
    await page.close();
  }

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
