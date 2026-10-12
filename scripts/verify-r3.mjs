import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:8788';
const ARTIFACT_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/0dfb30c0-dfa4-475d-bc24-b90c975659d7';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const report = {};

try {
  // 1. HOME DESKTOP (1280px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 30000 });

    const homeDesktopMetrics = await page.evaluate(() => {
      const h1 = document.querySelector('.home-hero__title');
      const featuredGrid = document.querySelector('.packs-grid');
      const card = document.querySelector('.pcard');
      const valuesSection = document.querySelector('.values-section');
      const includesSection = document.querySelector('.includes-grid');

      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        h1FontWeight: h1 ? window.getComputedStyle(h1).fontWeight : null,
        featuredGridCols: featuredGrid ? window.getComputedStyle(featuredGrid).gridTemplateColumns.split(' ').length : null,
        cardBorderRadius: card ? window.getComputedStyle(card).borderRadius : null,
        cardPadding: card ? window.getComputedStyle(card).padding : null,
        hasValuesStrip: !!valuesSection,
        hasIncludesSection: !!includesSection,
      };
    });

    report.homeDesktop = homeDesktopMetrics;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r3_home_desktop_1280px.png`, fullPage: false });
    await page.close();
  }

  // 2. HOME MOBILE (360px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 30000 });

    const homeMobileMetrics = await page.evaluate(() => {
      const h1 = document.querySelector('.home-hero__title');
      const featuredGrid = document.querySelector('.packs-grid');
      const card = document.querySelector('.pcard');

      return {
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        featuredGridCols: featuredGrid ? window.getComputedStyle(featuredGrid).gridTemplateColumns.split(' ').length : null,
        cardWidth: card ? card.getBoundingClientRect().width : null,
      };
    });

    report.homeMobile = homeMobileMetrics;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r3_home_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 3. PROJECTS DESKTOP (1280px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle0', timeout: 30000 });

    const projectsDesktopMetrics = await page.evaluate(() => {
      const title = document.querySelector('.projects-hero__title');
      const grid = document.querySelector('.projects-grid');
      const cards = document.querySelectorAll('.pcard');
      const activeChip = document.querySelector('.chip--active');
      const searchInput = document.querySelector('.search-input');
      const searchBtn = document.querySelector('.btn-search');

      return {
        titleText: title ? title.textContent.trim() : null,
        titleFontSize: title ? window.getComputedStyle(title).fontSize : null,
        gridColumnCount: grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').length : null,
        cardCount: cards.length,
        activeChipBg: activeChip ? window.getComputedStyle(activeChip).backgroundColor : null,
        activeChipColor: activeChip ? window.getComputedStyle(activeChip).color : null,
        searchInputHeight: searchInput ? window.getComputedStyle(searchInput).height : null,
        searchBtnHeight: searchBtn ? window.getComputedStyle(searchBtn).height : null,
      };
    });

    report.projectsDesktop = projectsDesktopMetrics;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r3_projects_desktop_1280px.png`, fullPage: false });
    await page.close();
  }

  // 4. PROJECTS MOBILE (360px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle0', timeout: 30000 });

    const projectsMobileMetrics = await page.evaluate(() => {
      const grid = document.querySelector('.projects-grid');
      const card = document.querySelector('.pcard');
      const searchInput = document.querySelector('.search-input');
      const searchBtn = document.querySelector('.btn-search');
      const categoriesScroll = document.querySelector('.categories-scroll');

      return {
        gridColumnCount: grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').length : null,
        cardWidth: card ? card.getBoundingClientRect().width : null,
        searchInputHeight: searchInput ? window.getComputedStyle(searchInput).height : null,
        searchBtnHeight: searchBtn ? window.getComputedStyle(searchBtn).height : null,
        categoriesScrollable: categoriesScroll ? categoriesScroll.scrollWidth > categoriesScroll.clientWidth : null,
      };
    });

    report.projectsMobile = projectsMobileMetrics;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r3_projects_mobile_360px.png`, fullPage: false });
    await page.close();
  }

  // 5. PROJECTS FILTER TEST (?price=free)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/projects?price=free`, { waitUntil: 'networkidle0', timeout: 30000 });

    const freeFilterMetrics = await page.evaluate(() => {
      const cards = document.querySelectorAll('.pcard');
      const titles = Array.from(cards).map(c => c.querySelector('.pcard__title')?.textContent.trim());
      const prices = Array.from(cards).map(c => c.querySelector('.pcard__price-wrap')?.textContent.trim());
      const activeChips = Array.from(document.querySelectorAll('.chip--active')).map(c => c.textContent.trim());

      return {
        cardCount: cards.length,
        titles,
        prices,
        activeChips
      };
    });

    report.freeFilter = freeFilterMetrics;
    await page.screenshot({ path: `${ARTIFACT_DIR}/r3_projects_filter_free.png`, fullPage: false });
    await page.close();
  }

  // 6. PROJECTS FILTER TEST (?price=paid)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/projects?price=paid`, { waitUntil: 'networkidle0', timeout: 30000 });

    const paidFilterMetrics = await page.evaluate(() => {
      const cards = document.querySelectorAll('.pcard');
      const titles = Array.from(cards).map(c => c.querySelector('.pcard__title')?.textContent.trim());
      const prices = Array.from(cards).map(c => c.querySelector('.pcard__price-wrap')?.textContent.trim());
      const activeChips = Array.from(document.querySelectorAll('.chip--active')).map(c => c.textContent.trim());

      return {
        cardCount: cards.length,
        titles,
        prices,
        activeChips
      };
    });

    report.paidFilter = paidFilterMetrics;
    await page.close();
  }

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
