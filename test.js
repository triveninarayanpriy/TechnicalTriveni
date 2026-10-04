import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('https://technical-triveni.innovationhubnitp.workers.dev/projects/diy-arduino-drone-nrf24-remote-receiver-flight-controller-bring-up-wiring-test-c', {waitUntil: 'networkidle2'});
  await browser.close();
})();
