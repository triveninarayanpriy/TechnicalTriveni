const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectMobileShell.astro', 'utf8');

const regex = /interface Props \{[\s\S]*?<\/div>/;
const replace = `interface Props {
  paid: boolean;
  priceLabel: string;
  comboTitle?: string | null;
  includedCount: number;
  singleFileUrl?: string;
  singleFileLabel?: string;
}
const { paid, priceLabel, comboTitle, includedCount, singleFileUrl, singleFileLabel } = Astro.props;
const sub = paid
  ? \`\${comboTitle || 'Build pack'}\${includedCount > 0 ? \` • \${includedCount} file\${includedCount === 1 ? '' : 's'}\` : ''}\`
  : (singleFileLabel || 'Free resources');
---

<div class="m-bar" data-m-bar>
  <div class="m-bar__info">
    <span class="m-bar__price">{priceLabel}</span>
    <span class="m-bar__sub">{sub}</span>
  </div>
  {singleFileUrl ? (
    <a href={singleFileUrl} class="btn btn-primary m-bar__btn" style="display:flex; align-items:center; gap:0.4rem; justify-content:center; flex-shrink: 0;" target="_blank" rel="noopener">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
      {singleFileLabel || 'Download'}
    </a>
  ) : (
    <button type="button" class="btn btn-primary m-bar__btn" data-m-open aria-haspopup="dialog">
      {paid ? 'Buy pack' : 'Get files'}
    </button>
  )}
</div>`;

content = content.replace(regex, replace);
fs.writeFileSync('src/components/ProjectMobileShell.astro', content);
