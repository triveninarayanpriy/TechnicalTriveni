import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  
  // Intercept JS to prevent execution (to capture FOUC state)
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.resourceType() === 'script') {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto('https://technical-triveni.innovationhubnitp.workers.dev/projects/diy-arduino-drone-nrf24-remote-receiver-flight-controller-bring-up-wiring-test-c', {waitUntil: 'networkidle2'});
  await page.screenshot({ path: 'fouc-test.png' });
  await browser.close();
  console.log('Saved fouc-test.png');
})();
