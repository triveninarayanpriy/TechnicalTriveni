const fs = require('fs');
let c = fs.readFileSync('src/components/ProjectLayoutV2.astro', 'utf8');

// 1. Fix hero-meta to allow wrapping
c = c.replace(
  '<div class="hero-meta" style="margin-top: 1rem; display: flex; gap: 0.75rem; align-items: center;">',
  '<div class="hero-meta" style="margin-top: 1rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">'
);

// 2. Remove inline grid styles from v2-grid
c = c.replace(
  '<div class="v2-grid" style="display: grid; grid-template-columns: 1fr 320px; gap: 2rem; margin-top: 2rem; align-items: start;">',
  '<div class="v2-grid">'
);

// 3. Remove inline sticky styles from v2-sidebar
c = c.replace(
  '<aside class="v2-sidebar" style="position: sticky; top: calc(var(--header-h, 60px) + 1.5rem); display: flex; flex-direction: column; gap: 1.5rem;">',
  '<aside class="v2-sidebar">'
);

// 4. Add the mobile sticky bar markup right after the sidebar
const mobileBarHtml = `
    </div>
    
    <!-- MOBILE STICKY BUY BAR -->
    <div class="mobile-buy-bar">
      <div class="mobile-buy-bar__info">
        <span class="mobile-buy-bar__price">{paid ? '&#8377;' + project.price_inr : 'Free'}</span>
        <span class="mobile-buy-bar__label">{project.combo_title || 'Combo Pack'}</span>
      </div>
      <button class="btn btn-primary"><Icon name="lock" size={16} /> Buy &amp; Download</button>
    </div>
`;
c = c.replace(
  '    </div>\n\n  </div>\n</div>\n\n<script>',
  mobileBarHtml + '\n  </div>\n</div>\n\n<script>'
);

// 5. Add the CSS rules
const cssRules = `
  /* ===== Responsive Logic ===== */
  .v2-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 2rem;
    margin-top: 2rem;
    align-items: start;
  }
  .v2-sidebar {
    position: sticky;
    top: calc(var(--header-h, 60px) + 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .mobile-buy-bar {
    display: none;
  }

  @media (max-width: 900px) {
    .v2-grid {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      margin-top: 1.5rem;
    }
    .v2-sidebar {
      position: static;
      display: none; /* Hide sidebar entirely on mobile, rely on inline content and sticky bar */
    }
    /* Make the safety box full width on small screens */
    .v2-safety {
      margin-left: -1rem;
      margin-right: -1rem;
      border-radius: 0;
      border-left: none;
      border-right: none;
    }
    .mobile-buy-bar {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 0.75rem 1rem;
      z-index: 100;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
    }
    .mobile-buy-bar__info {
      display: flex;
      flex-direction: column;
    }
    .mobile-buy-bar__price {
      font-weight: 700;
      font-size: 1.25rem;
      font-family: var(--font-display);
      line-height: 1.1;
    }
    .mobile-buy-bar__label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    /* Add padding to body on mobile so content isn't hidden behind the sticky bar */
    .proj-layout-v2 {
      padding-bottom: 80px;
    }
  }
`;

c = c.replace('<style>', '<style>\n' + cssRules);

fs.writeFileSync('src/components/ProjectLayoutV2.astro', c);
