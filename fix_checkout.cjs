const fs = require('fs');
let c = fs.readFileSync('src/components/ProjectLayoutV2.astro', 'utf8');

// 1. Un-hide v2-sidebar on mobile
c = c.replace(
  '.v2-sidebar {\n      position: static;\n      display: none; /* Hide sidebar entirely on mobile, rely on inline content and sticky bar */\n    }',
  '.v2-sidebar {\n      position: static;\n      display: flex;\n    }'
);

// 2. Add checkout attributes to cta-card
const oldCtaCardStart = '<div class="cta-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">';
const newCtaCardStart = `<div class="cta-card" id="buy" data-buy data-project-id={project.id} data-slug={project.slug} data-payments={paid ? '1' : '0'} style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">`;
c = c.replace(oldCtaCardStart, newCtaCardStart);

// 3. Add email input and data-buy-btn
const oldButton = '<button class="btn btn-primary btn-block" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 1rem; font-weight: 600;"><Icon name="lock" size={16} /> Buy &amp; download</button>';
const newButton = `
          <div class="cta-card__action" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="input-wrap">
              <input type="email" id="buy-email" class="input input--sm" style="width: 100%;" placeholder="Your email address..." required />
            </div>
            <button type="button" class="btn btn-primary btn-block btn-buy" data-buy-btn style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 1rem; font-weight: 600;">
              <Icon name="lock" size={16} /> {paid ? 'Buy &amp; download' : 'Get free resources'}
            </button>
          </div>
`;
c = c.replace(oldButton, newButton);

// 4. Update the mobile sticky bar button to scroll
const oldMobileBtn = '<button class="btn btn-primary"><Icon name="lock" size={16} /> Buy &amp; Download</button>';
const newMobileBtn = '<button class="btn btn-primary" onclick="document.getElementById(\'buy\')?.scrollIntoView({behavior:\'smooth\'})">{paid ? \'Buy now\' : \'Get now\'}</button>';
c = c.replace(oldMobileBtn, newMobileBtn);

fs.writeFileSync('src/components/ProjectLayoutV2.astro', c);
