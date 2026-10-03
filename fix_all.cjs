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

// 4. Update BOM Table with responsive wrapper (MATCHING EXACTLY)
const oldBomStart = '<table class="bom v2-bom" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
const newBomStart = '<div class="table-responsive"><table class="bom v2-bom" style="width: 100%; border-collapse: collapse; font-size: 0.9rem; min-width: 500px;">';
c = c.replace(oldBomStart, newBomStart);

const oldBomEnd = '                </tbody>\n              </table>\n            </div>\n          ))}';
const newBomEnd = '                </tbody>\n              </table>\n            </div>\n            </div>\n          ))}';
c = c.replace(oldBomEnd, newBomEnd);

// 5. Update Pins Table with responsive wrapper
const oldPinsStart = '<table class="pins v2-pins">';
const newPinsStart = '<div class="table-responsive"><table class="pins v2-pins" style="min-width: 450px;">';
c = c.replace(oldPinsStart, newPinsStart);

const oldPinsEnd = '                    </tbody>\n                  </table>\n                </div>\n              ))}';
const newPinsEnd = '                    </tbody>\n                  </table>\n                </div>\n                </div>\n              ))}';
c = c.replace(oldPinsEnd, newPinsEnd);

// 6. Fix Checkout UI
const oldCtaCardStart = '<div class="cta-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">';
const newCtaCardStart = `<div class="cta-card" id="buy" data-buy data-project-id={project.id} data-slug={project.slug} data-payments={paid ? '1' : '0'} style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">`;
c = c.replace(oldCtaCardStart, newCtaCardStart);

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

// 7. Add mobile sticky bar
const mobileBarHtml = `
    </div>
    
    <!-- MOBILE STICKY BUY BAR -->
    <div class="mobile-buy-bar">
      <div class="mobile-buy-bar__info">
        <span class="mobile-buy-bar__price">{paid ? '&#8377;' + project.price_inr : 'Free'}</span>
        <span class="mobile-buy-bar__label">{project.combo_title || 'Combo Pack'}</span>
      </div>
      <button class="btn btn-primary" onclick="document.getElementById('buy')?.scrollIntoView({behavior:'smooth'})">{paid ? 'Buy now' : 'Get now'}</button>
    </div>
`;
c = c.replace(
  '    </div>\n\n  </div>\n</div>\n\n<script>',
  mobileBarHtml + '\n  </div>\n</div>\n\n<script>'
);

// 8. Add CSS
const cssRules = `
  /* ===== Responsive Logic ===== */
  .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
  .v2-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; margin-top: 2rem; align-items: start; }
  .v2-sidebar { position: sticky; top: calc(var(--header-h, 60px) + 1.5rem); display: flex; flex-direction: column; gap: 1.5rem; }
  .mobile-buy-bar { display: none; }

  @media (max-width: 900px) {
    .v2-grid { display: flex; flex-direction: column; gap: 3rem; margin-top: 1.5rem; }
    .v2-sidebar { position: static; display: flex; }
    .v2-safety { margin-left: -1rem; margin-right: -1rem; border-radius: 0; border-left: none; border-right: none; }
    .mobile-buy-bar {
      display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface);
      border-top: 1px solid var(--border); padding: 0.75rem 1rem; z-index: 100;
      justify-content: space-between; align-items: center; box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
    }
    .mobile-buy-bar__info { display: flex; flex-direction: column; }
    .mobile-buy-bar__price { font-weight: 700; font-size: 1.25rem; font-family: var(--font-display); line-height: 1.1; }
    .mobile-buy-bar__label { font-size: 0.75rem; color: var(--text-muted); }
    .proj-layout-v2 { padding-bottom: 80px; }
  }
`;

c = c.replace('<style>', '<style>\n' + cssRules);

fs.writeFileSync('src/components/ProjectLayoutV2.astro', c);
