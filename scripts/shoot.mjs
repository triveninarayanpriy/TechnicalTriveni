import puppeteer from 'puppeteer-core';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.env.SHOT_DIR || '.';
const BASE = 'http://localhost:4321';

const shots = [
  { path: '/', name: 'home-desktop', w: 1440, h: 950, full: false },
  { path: '/', name: 'home-full', w: 1440, h: 950, full: true },
  { path: '/projects', name: 'projects-desktop', w: 1440, h: 950, full: false },
  { path: '/projects/iot-weather-station-esp32', name: 'detail-full', w: 1440, h: 950, full: true },
  { path: '/', name: 'home-mobile', w: 390, h: 844, full: false, mobile: true },
  { path: '/', name: 'home-mobile-full', w: 390, h: 844, full: true, mobile: true },
  { path: '/projects', name: 'projects-mobile', w: 390, h: 844, full: true, mobile: true },
  { path: '/projects/iot-weather-station-esp32', name: 'detail-mobile', w: 390, h: 844, full: true, mobile: true },
];

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  userDataDir: process.env.TMP + '/tt-edge-shots',
  args: ['--no-sandbox', '--no-first-run', '--hide-scrollbars'],
});

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: s.mobile ? 2 : 1, isMobile: !!s.mobile });
  await page.goto(BASE + s.path, { waitUntil: 'networkidle2', timeout: 45000 });
  // Force-reveal all scroll-animated elements so full-page captures aren't blank.
  await page.evaluate(() =>
    document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-visible')),
  );
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: !!s.full });
  console.log('✓', s.name);
  await page.close();
}
await browser.close();
