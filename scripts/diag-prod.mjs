import puppeteer from 'puppeteer-core';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = process.argv[2] || 'https://technical-triveni.innovationhubnitp.workers.dev/';
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  userDataDir: process.env.TMP + '/tt-edge-profile',
  args: ['--no-sandbox', '--no-first-run', '--hide-scrollbars'],
});
const page = await browser.newPage();
const msgs = [];
page.on('console', (m) => msgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => msgs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => msgs.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`));
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 1500));
const info = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  const revealCount = document.querySelectorAll('[data-reveal]').length;
  const visibleCount = document.querySelectorAll('[data-reveal].is-visible').length;
  const cs = h1 ? getComputedStyle(h1) : null;
  return {
    h1text: h1?.textContent?.trim().slice(0, 40),
    h1opacity: cs?.opacity,
    revealCount, visibleCount,
    scripts: [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src')).slice(0, 8),
  };
});
console.log('INFO:', JSON.stringify(info, null, 2));
console.log('CONSOLE:\n' + (msgs.join('\n') || '(none)'));
const shot = (process.env.SHOT_DIR || '.') + '/prod-home.png';
await page.screenshot({ path: shot });
console.log('screenshot:', shot);
await browser.close();
