import puppeteer from 'puppeteer';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  console.log('Testing My Downloads Redesign...');

  // 1. Desktop 1366x768
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(`${BASE_URL}/account/downloads`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  
  const dStats = await page.evaluate(() => {
    const card = document.querySelector('.mydl-card');
    const input = document.querySelector('.mydl-input');
    const btn = document.querySelector('.mydl-form__btn');
    const faq = document.querySelector('.mydl-faq');
    return {
      cardWidth: card ? Math.round(card.getBoundingClientRect().width) : null,
      inputWidth: input ? Math.round(input.getBoundingClientRect().width) : null,
      inputHeight: input ? Math.round(input.getBoundingClientRect().height) : null,
      btnWidth: btn ? Math.round(btn.getBoundingClientRect().width) : null,
      btnHeight: btn ? Math.round(btn.getBoundingClientRect().height) : null,
      faqVisible: !!faq,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    };
  });
  console.log('Desktop 1366x768 stats:', dStats);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'downloads_desktop_full.png'), fullPage: true });

  // 2. Mobile 390x844
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/account/downloads`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  
  const mStats = await page.evaluate(() => {
    const card = document.querySelector('.mydl-card');
    const input = document.querySelector('.mydl-input');
    const btn = document.querySelector('.mydl-form__btn');
    return {
      cardWidth: card ? Math.round(card.getBoundingClientRect().width) : null,
      inputWidth: input ? Math.round(input.getBoundingClientRect().width) : null,
      btnWidth: btn ? Math.round(btn.getBoundingClientRect().width) : null,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    };
  });
  console.log('Mobile 390x844 stats:', mStats);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'downloads_mobile_full.png'), fullPage: true });

  // 3. Sent state transition
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(`${BASE_URL}/account/downloads`, { waitUntil: 'networkidle2' });
  await page.type('.mydl-input', 'alex@gmail.com');
  await page.click('.mydl-form__btn');
  await new Promise(r => setTimeout(r, 500));

  const sentStats = await page.evaluate(() => {
    const sent = document.querySelector('[data-magic-sent]');
    const formWrap = document.querySelector('[data-magic-form-wrap]');
    const targetEmail = document.querySelector('[data-sent-email]');
    const gmailBtn = document.querySelector('[data-gmail-btn]');
    return {
      sentVisible: sent && !sent.hidden && window.getComputedStyle(sent).display !== 'none',
      formWrapHidden: formWrap && (formWrap.hidden || window.getComputedStyle(formWrap).display === 'none'),
      email: targetEmail ? targetEmail.textContent : null,
      gmailVisible: gmailBtn && !gmailBtn.hidden && window.getComputedStyle(gmailBtn).display !== 'none'
    };
  });
  console.log('Sent state transition stats:', sentStats);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'downloads_sent_state_verified.png') });

  // 4. Download invalid link page
  await page.goto(`${BASE_URL}/account/download?order=invalid&token=bad`, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'download_invalid_link.png') });
  console.log('Tested invalid download link page.');

  await browser.close();
}

main().catch(console.error);
