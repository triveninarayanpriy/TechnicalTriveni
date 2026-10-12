import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const report = {};

try {
  // 1. HOW IT WORKS - Desktop 1280px & Mobile 360px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/how-it-works`, { waitUntil: 'networkidle0', timeout: 30000 });

    const hiwDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.hiw-title');
      const stepCards = document.querySelectorAll('.hiw-card').length;
      const faqItems = document.querySelectorAll('.hiw-faq__item').length;
      return {
        h1Text: h1?.textContent.trim(),
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        stepCards,
        faqItems,
      };
    });
    report.hiwDesktop = hiwDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_hiw_desktop_1280px.png`, fullPage: false });

    // Mobile
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/how-it-works`, { waitUntil: 'networkidle0', timeout: 30000 });
    const hiwMobile = await page.evaluate(() => {
      const h1 = document.querySelector('.hiw-title');
      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
      };
    });
    report.hiwMobile = hiwMobile;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_hiw_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 2. MY DOWNLOADS - Desktop 1280px & Mobile 360px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/account/downloads`, { waitUntil: 'networkidle0', timeout: 30000 });

    const dlDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.mydl-title');
      const emailInput = document.querySelector('.mydl__input');
      const submitBtn = document.querySelector('.mydl__btn');
      return {
        h1Text: h1?.textContent.trim(),
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        hasEmailInput: !!emailInput,
        btnText: submitBtn?.textContent.trim(),
        btnHeight: submitBtn ? window.getComputedStyle(submitBtn).height : null,
      };
    });
    report.downloadsDesktop = dlDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_downloads_desktop_1280px.png`, fullPage: false });

    // Mobile
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/account/downloads`, { waitUntil: 'networkidle0', timeout: 30000 });
    const dlMobile = await page.evaluate(() => {
      const h1 = document.querySelector('.mydl-title');
      const submitBtn = document.querySelector('.mydl__btn');
      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        btnHeight: submitBtn ? window.getComputedStyle(submitBtn).height : null,
      };
    });
    report.downloadsMobile = dlMobile;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_downloads_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 3. ABOUT - Desktop 1280px & Mobile 360px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/about`, { waitUntil: 'networkidle0', timeout: 30000 });

    const aboutDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.about-title');
      const photo = document.querySelector('.about-photo');
      const values = document.querySelectorAll('.value-card').length;
      return {
        h1Text: h1?.textContent.trim(),
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        photoSrc: photo?.getAttribute('src'),
        valueCards: values,
      };
    });
    report.aboutDesktop = aboutDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_about_desktop_1280px.png`, fullPage: false });

    // Mobile
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/about`, { waitUntil: 'networkidle0', timeout: 30000 });
    const aboutMobile = await page.evaluate(() => {
      const h1 = document.querySelector('.about-title');
      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
      };
    });
    report.aboutMobile = aboutMobile;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_about_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 4. CONTACT - Desktop 1280px & Mobile 360px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle0', timeout: 30000 });

    const contactDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.contact-title');
      const newsletter = document.querySelector('#newsletter');
      const submitBtn = document.querySelector('.btn-submit');
      const replyBadge = document.querySelector('.reply-badge')?.textContent.trim();
      return {
        h1Text: h1?.textContent.trim(),
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        newsletterCheckedByDefault: newsletter?.checked,
        btnText: submitBtn?.textContent.trim(),
        replyBadge: replyBadge || 'none',
      };
    });
    report.contactDesktop = contactDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_contact_desktop_1280px.png`, fullPage: false });

    // Mobile
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle0', timeout: 30000 });
    const contactMobile = await page.evaluate(() => {
      const h1 = document.querySelector('.contact-title');
      const submitBtn = document.querySelector('.btn-submit');
      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        btnHeight: submitBtn ? window.getComputedStyle(submitBtn).height : null,
      };
    });
    report.contactMobile = contactMobile;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_contact_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 5. LEGAL (TERMS) - Desktop 1280px & Mobile 360px
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/legal/terms`, { waitUntil: 'networkidle0', timeout: 30000 });

    const legalDesktop = await page.evaluate(() => {
      const h1 = document.querySelector('.legal-title');
      const pills = document.querySelectorAll('.legal-pill').length;
      return {
        h1Text: h1?.textContent.trim(),
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        policyPills: pills,
      };
    });
    report.legalDesktop = legalDesktop;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_legal_terms_desktop_1280px.png`, fullPage: false });

    // Mobile
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/legal/terms`, { waitUntil: 'networkidle0', timeout: 30000 });
    const legalMobile = await page.evaluate(() => {
      const h1 = document.querySelector('.legal-title');
      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
      };
    });
    report.legalMobile = legalMobile;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r5_legal_terms_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
