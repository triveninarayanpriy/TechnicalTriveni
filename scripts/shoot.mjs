import puppeteer from 'puppeteer';

const OUT = process.env.SHOT_DIR || '.';
const BASE = 'http://localhost:4321';

const shots = [
  { path: '/about', name: 'about-desktop', w: 1440, h: 950, full: true },
  { path: '/about', name: 'about-mobile', w: 390, h: 844, full: true, mobile: true },
  { path: '/how-it-works', name: 'hiw-desktop', w: 1440, h: 950, full: true },
  { path: '/', name: 'home-desktop', w: 1440, h: 950, full: false },
  { path: '/', name: 'home-full', w: 1440, h: 950, full: true },
  { path: '/projects', name: 'projects-desktop', w: 1440, h: 950, full: true },
  { path: '/projects?page=2', name: 'projects-page2', w: 1440, h: 950, full: true },
  { path: '/projects/iot-weather-station-esp32', name: 'detail-full', w: 1440, h: 950, full: true },
  { path: '/', name: 'home-mobile', w: 390, h: 844, full: false, mobile: true },
  { path: '/', name: 'home-mobile-full', w: 390, h: 844, full: true, mobile: true },
  { path: '/projects', name: 'projects-mobile', w: 390, h: 844, full: true, mobile: true },
  { path: '/projects/iot-weather-station-esp32', name: 'detail-mobile', w: 390, h: 844, full: true, mobile: true },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars'],
});

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: s.mobile ? 2 : 1, isMobile: !!s.mobile });
  await page.goto(BASE + s.path, { waitUntil: 'networkidle2', timeout: 45000 });
  // Force-reveal all scroll-animated elements so full-page captures aren't blank.
  await page.evaluate(() =>
    document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-visible')),
  );
  // give <model-viewer> time to load its remote .glb, if present
  const hasModel = await page.evaluate(() => !!document.querySelector('model-viewer'));
  await new Promise((r) => setTimeout(r, hasModel ? 4000 : 900));
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: !!s.full });
  console.log('✓', s.name);
  await page.close();
}
await browser.close();
