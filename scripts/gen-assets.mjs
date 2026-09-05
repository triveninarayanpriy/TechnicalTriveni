/**
 * Generates raster brand assets from the source SVGs:
 *   • PNG favicons (180/192/512) for browsers & PWA
 *   • a 1200×630 Open Graph share image
 * Run with:  node scripts/gen-assets.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pub = resolve(root, 'public');
mkdirSync(resolve(pub, 'brand'), { recursive: true });

const RED = '#e7242a';
const INK = '#0e0f12';

const glyph = 'M12 0 L62 0 L62 18 L41 18 L41 74 L31 92 L21 74 L21 18 L0 18 L0 7 L12 7 Z';

/** The monogram, with configurable glyph colors, on a transparent canvas. */
function markSvg(c1, c2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 120 100">
    <defs><path id="g" d="${glyph}"/></defs>
    <use href="#g" x="0" fill="${c1}"/><use href="#g" x="50" fill="${c2}"/>
  </svg>`;
}

async function png(svg, size, file, bg = { r: 0, g: 0, b: 0, alpha: 0 }) {
  await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: 'contain', background: bg })
    .png()
    .toFile(resolve(pub, file));
  console.log('✓', file);
}

// --- App-icon style favicons: mark (red + white) on a dark rounded tile ---
function tileSvg(px) {
  const r = Math.round(px * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs><path id="g" d="${glyph}"/></defs>
    <rect width="128" height="128" rx="${(r / px) * 128}" fill="${INK}"/>
    <g transform="translate(15 20) scale(0.86)">
      <use href="#g" x="0" fill="${RED}"/><use href="#g" x="50" fill="#ffffff"/>
    </g>
  </svg>`;
}
await png(tileSvg(180), 180, 'apple-touch-icon.png');
await png(tileSvg(192), 192, 'brand/icon-192.png');
await png(tileSvg(512), 512, 'brand/icon-512.png');

// --- Transparent monogram (red + white) for use on dark surfaces ---
await sharp(Buffer.from(markSvg(RED, '#ffffff')), { density: 384 })
  .resize(400, null, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(resolve(pub, 'brand/logo-mark-ondark.png'));
console.log('✓ brand/logo-mark-ondark.png');

// --- Open Graph image: 1200×630, dark, monogram + wordmark + tagline ---
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111114"/><stop offset="1" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.1" r="0.6">
      <stop offset="0" stop-color="${RED}" stop-opacity="0.28"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/>
    </radialGradient>
    <path id="g" d="${glyph}"/>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="14" height="630" fill="${RED}"/>
  <g transform="translate(96 150) scale(1.7)">
    <use href="#g" x="0" fill="${RED}"/><use href="#g" x="50" fill="#ffffff"/>
  </g>
  <text x="360" y="250" font-family="'Segoe UI',sans-serif" font-size="76" font-weight="800" fill="#ffffff">TECHNICAL</text>
  <text x="360" y="340" font-family="'Segoe UI',sans-serif" font-size="76" font-weight="800" fill="${RED}">TRIVENI</text>
  <text x="364" y="410" font-family="'Segoe UI',sans-serif" font-size="30" letter-spacing="6" fill="#adb2bd">ELECTRONICS · SOFTWARE · AI</text>
  <text x="96" y="560" font-family="'Segoe UI',sans-serif" font-size="30" fill="#d7dae0">Full schematics · code · 3D files · BOM &amp; parts links — for every build.</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(resolve(pub, 'og-default.png'));
console.log('✓ og-default.png');

// --- A visual check image on white (both glyphs in brand colors) ---
await sharp(Buffer.from(markSvg(RED, INK)), { density: 384 })
  .resize(500, null, { fit: 'contain', background: '#ffffff' })
  .flatten({ background: '#ffffff' })
  .png()
  .toFile(resolve(pub, 'brand/_check.png'));
console.log('✓ brand/_check.png');
