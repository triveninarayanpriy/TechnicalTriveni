/**
 * Generates branded placeholder cover images for the seed/sample projects.
 * These are meant to be REPLACED by real project photos via the admin panel.
 * Run:  node scripts/gen-covers.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'public', 'covers');
mkdirSync(dir, { recursive: true });

const RED = '#e7242a';

// simple 24x24 icon path bodies (stroke)
const icons = {
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9.5 2v3M14.5 2v3M9.5 19v3M14.5 19v3M2 9.5h3M2 14.5h3M19 9.5h3M19 14.5h3"/>',
  robot: '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 4v4M8 13h.01M16 13h.01M9 16h6"/><circle cx="12" cy="4" r="1.4"/>',
  ai: '<path d="M12 3v3M12 18v3M4.2 7l2.6 1.5M17.2 15.5 19.8 17M4.2 17l2.6-1.5M17.2 8.5 19.8 7"/><circle cx="12" cy="12" r="3.2"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
};

const covers = [
  { file: 'esp32-weather.png', title: 'IoT Weather Station', tag: 'ESP32 · IoT', icon: 'cpu' },
  { file: 'line-robot.png', title: 'Line-Following Robot', tag: 'Arduino · Robotics', icon: 'robot' },
  { file: 'ai-voice-dashboard.png', title: 'AI Voice Home Hub', tag: 'AI · Software', icon: 'ai' },
  { file: 'rfid-lock.png', title: 'RFID Door Lock', tag: 'Access · Security', icon: 'lock' },
];

function svg({ title, tag, icon }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#15161b"/><stop offset="1" stop-color="#0a0a0c"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.85" cy="0.15" r="0.7">
        <stop offset="0" stop-color="${RED}" stop-opacity="0.30"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1280" height="800" fill="url(#bg)"/>
    <rect width="1280" height="800" fill="url(#grid)"/>
    <rect width="1280" height="800" fill="url(#glow)"/>
    <rect x="0" y="0" width="10" height="800" fill="${RED}"/>
    <g transform="translate(880 250) scale(9)" fill="none" stroke="${RED}" stroke-width="1.4"
       stroke-linecap="round" stroke-linejoin="round" opacity="0.9">${icons[icon]}</g>
    <text x="90" y="470" font-family="'Segoe UI',sans-serif" font-size="34" letter-spacing="4"
      fill="${RED}" font-weight="700">${tag.toUpperCase()}</text>
    <text x="86" y="560" font-family="'Segoe UI',sans-serif" font-size="76" fill="#ffffff" font-weight="800">${title}</text>
    <text x="90" y="720" font-family="'Segoe UI',sans-serif" font-size="26" letter-spacing="5"
      fill="#adb2bd">TECHNICAL TRIVENI · SAMPLE</text>
  </svg>`;
}

for (const c of covers) {
  await sharp(Buffer.from(svg(c))).png().toFile(resolve(dir, c.file));
  console.log('✓ covers/' + c.file);
}
