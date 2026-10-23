import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';
const BASE_URL = 'https://technical-triveni.innovationhubnitp.workers.dev';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('Testing Desktop (1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // Check hero pack card on desktop
  const desktopHeroCardVisible = await page.evaluate(() => {
    const el = document.querySelector('.home-hero-pack-card');
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });

  // Check mobile-only card in featured container on desktop
  const desktopFeaturedCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#featured-pack-container .pack-card-item'));
    return cards.map(c => {
      const style = window.getComputedStyle(c);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
      const title = c.querySelector('.pack-card-title')?.textContent?.trim() || '';
      const isMobileOnly = c.classList.contains('pack-card-item--mobile-only');
      return { title, isVisible, isMobileOnly, display: style.display };
    });
  });

  console.log('Desktop Hero Card Visible:', desktopHeroCardVisible);
  console.log('Desktop Featured Cards in Container:', desktopFeaturedCards);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'home_desktop_verified.png'), fullPage: false });

  // Scroll to featured projects on desktop
  await page.evaluate(() => {
    const el = document.querySelector('.home-featured-section');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'home_desktop_featured_verified.png'), fullPage: false });

  console.log('\nTesting Mobile (390x844)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // Check hero pack card on mobile (should be hidden)
  const mobileHeroCardVisible = await page.evaluate(() => {
    const el = document.querySelector('.home-hero-pack-card');
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });

  // Check featured cards on mobile (first one should be mobile-only drone card)
  const mobileFeaturedCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#featured-pack-container .pack-card-item'));
    return cards.map(c => {
      const style = window.getComputedStyle(c);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
      const title = c.querySelector('.pack-card-title')?.textContent?.trim() || '';
      const isMobileOnly = c.classList.contains('pack-card-item--mobile-only');
      const price = c.querySelector('.pack-card-price')?.textContent?.trim() || '';
      return { title, isVisible, isMobileOnly, price, display: style.display };
    });
  });

  console.log('Mobile Hero Card Visible (should be false):', mobileHeroCardVisible);
  console.log('Mobile Featured Cards in Container:', mobileFeaturedCards);

  // Screenshot mobile hero
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'home_mobile_hero_verified.png'), fullPage: false });

  // Scroll to featured projects carousel on mobile
  await page.evaluate(() => {
    const el = document.querySelector('.home-featured-section');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'home_mobile_featured_all_verified.png'), fullPage: false });

  // Test Free Tab filter
  console.log('\nTesting Free Tab on Mobile...');
  await page.click('button[data-home-tab="free"]');
  await new Promise(r => setTimeout(r, 300));

  const mobileFreeTabCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#featured-pack-container .pack-card-item'));
    return cards.map(c => {
      const style = window.getComputedStyle(c);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
      const title = c.querySelector('.pack-card-title')?.textContent?.trim() || '';
      return { title, isVisible, display: style.display };
    });
  });
  console.log('Mobile Cards under "Free" tab:', mobileFreeTabCards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'home_mobile_featured_free_verified.png'), fullPage: false });

  // Test Paid Tab filter
  console.log('\nTesting Paid Tab on Mobile...');
  await page.click('button[data-home-tab="paid"]');
  await new Promise(r => setTimeout(r, 300));

  const mobilePaidTabCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#featured-pack-container .pack-card-item'));
    return cards.map(c => {
      const style = window.getComputedStyle(c);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
      const title = c.querySelector('.pack-card-title')?.textContent?.trim() || '';
      return { title, isVisible, display: style.display };
    });
  });
  console.log('Mobile Cards under "Paid" tab:', mobilePaidTabCards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'home_mobile_featured_paid_verified.png'), fullPage: false });

  await browser.close();
  console.log('\nAll checks completed successfully!');
}

main().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
