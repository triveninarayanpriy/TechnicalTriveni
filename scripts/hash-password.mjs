/**
 * Generate an admin password hash for ADMIN_PASSWORD_HASH.
 * Uses the SAME PBKDF2-SHA256 scheme the app verifies (src/lib/crypto.ts).
 *
 * Usage:
 *   node scripts/hash-password.mjs "your-strong-password"
 */
const ITERATIONS = 210_000;

function toB64Url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const password = process.argv[2];
if (!password) {
  console.error('\n  Usage: node scripts/hash-password.mjs "your-password"\n');
  process.exit(1);
}
if (password.length < 8) {
  console.error('\n  ⚠ Please choose a password of at least 8 characters.\n');
  process.exit(1);
}

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  key,
  256,
);
const hash = `pbkdf2$${ITERATIONS}$${toB64Url(salt)}$${toB64Url(new Uint8Array(bits))}`;

console.log('\n  ADMIN_PASSWORD_HASH (copy the whole line below):\n');
console.log('  ' + hash + '\n');
console.log('  • Local dev: paste into .dev.vars');
console.log('  • Production: wrangler pages secret put ADMIN_PASSWORD_HASH\n');
