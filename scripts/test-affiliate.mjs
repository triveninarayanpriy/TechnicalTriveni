import assert from 'node:assert';
import {
  validateAmazonTag,
  validateAsin,
  extractAsin,
  buildAmazonLink,
  searchLink,
  buildComponentAffiliateUrl,
  DEFAULT_AFFILIATE_SETTINGS
} from '../src/lib/affiliate.ts';

console.log('🧪 Running Affiliate Link Builder Unit Tests...\n');

// 1. Tag Validation Tests
assert.strictEqual(validateAmazonTag('tech-triveni-21'), true, 'Valid tag with hyphens');
assert.strictEqual(validateAmazonTag('triveni20-21'), true, 'Valid alphanumeric tag');
assert.strictEqual(validateAmazonTag('techtriveni-21'), true, 'Valid tag without hyphens');
assert.strictEqual(validateAmazonTag('Tech-Triveni-21'), false, 'Uppercase rejected');
assert.strictEqual(validateAmazonTag('tech_triveni-21'), false, 'Underscore rejected');
assert.strictEqual(validateAmazonTag('tech-triveni-20'), false, 'Non-21 suffix rejected');
assert.strictEqual(validateAmazonTag('tech-triveni'), false, 'Missing suffix rejected');
console.log('✅ 1. Tag Validation passed.');

// 2. Long URL full of tracking junk
const junkUrl = 'https://www.amazon.in/Robocraze-Development-Dual-Core-Microcontroller-Bluetooth/dp/B0716S5LQN/ref=sr_1_1?crid=123456789&keywords=esp32&qid=1600000000&sprefix=esp%2Caps%2C200&sr=8-1&pd_rd_w=xyz&pf_rd_p=abc&linkCode=ll1&ascsubtag=customtag';
const cleaned1 = buildAmazonLink(junkUrl, 'tech-triveni-21');
assert.strictEqual(cleaned1.asin, 'B0716S5LQN', 'ASIN extracted from messy URL');
assert.strictEqual(cleaned1.url, 'https://www.amazon.in/dp/B0716S5LQN?tag=tech-triveni-21', 'All junk params stripped');
assert.strictEqual(cleaned1.canonicalUrl, 'https://www.amazon.in/dp/B0716S5LQN', 'Canonical URL is tag-free');
console.log('✅ 2. Long URL full of tracking junk stripped cleanly.');

// 3. /gp/product/ URL with variant parameter preserved
const gpUrl = 'https://amazon.in/gp/product/B086MGVDC3?th=1&psc=1&ref_=nav_signin';
const cleaned2 = buildAmazonLink(gpUrl, 'tech-triveni-21');
assert.strictEqual(cleaned2.asin, 'B086MGVDC3');
assert.strictEqual(cleaned2.url, 'https://www.amazon.in/dp/B086MGVDC3?tag=tech-triveni-21&th=1&psc=1', 'Preserves th and psc');
assert.strictEqual(cleaned2.canonicalUrl, 'https://www.amazon.in/dp/B086MGVDC3?th=1&psc=1', 'Canonical preserves variant without tag');
console.log('✅ 3. /gp/product/ URL parsed and variants preserved.');

// 4. URL with someone else's tag
const foreignTagUrl = 'https://www.amazon.in/dp/B0716S5LQN?tag=maliciousaffiliate-21&linkCode=osi';
const cleaned3 = buildAmazonLink(foreignTagUrl, 'tech-triveni-21');
assert.strictEqual(cleaned3.url, 'https://www.amazon.in/dp/B0716S5LQN?tag=tech-triveni-21', 'Foreign tag replaced with mine');
console.log('✅ 4. Foreign affiliate tag replaced.');

// 5. Host rejection (amazon.com)
assert.throws(() => {
  buildAmazonLink('https://www.amazon.com/dp/B0716S5LQN', 'tech-triveni-21');
}, /Only Amazon India \(amazon\.in or www\.amazon\.in\) links are supported/, 'Rejects amazon.com');
console.log('✅ 5. amazon.com host rejected.');

// 6. Malformed ASIN rejection
assert.throws(() => {
  buildAmazonLink('https://www.amazon.in/dp/SHORT12', 'tech-triveni-21');
}, /No valid 10-character Amazon ASIN found/, 'Rejects short ASIN');
assert.throws(() => {
  buildAmazonLink('https://www.amazon.in/dp/INVALID_ASIN_TOO_LONG', 'tech-triveni-21');
}, /No valid 10-character Amazon ASIN found/, 'Rejects long ASIN');
console.log('✅ 6. Malformed ASIN rejected.');

// 7. Shortened links rejection (amzn.to, a.co, amzn.in)
assert.throws(() => {
  buildAmazonLink('https://amzn.to/3xyzABC', 'tech-triveni-21');
}, /Shortened link detected/, 'Rejects amzn.to');
assert.throws(() => {
  buildAmazonLink('https://a.co/d/abcdefg', 'tech-triveni-21');
}, /Shortened link detected/, 'Rejects a.co');
assert.throws(() => {
  buildAmazonLink('https://amzn.in/d/1234567', 'tech-triveni-21');
}, /Shortened link detected/, 'Rejects amzn.in');
console.log('✅ 7. Shortened links rejected with browser instruction.');

// 8. Plain ASIN input
const rawAsinClean = buildAmazonLink('b0716s5lqn', 'tech-triveni-21');
assert.strictEqual(rawAsinClean.asin, 'B0716S5LQN');
assert.strictEqual(rawAsinClean.url, 'https://www.amazon.in/dp/B0716S5LQN?tag=tech-triveni-21');
console.log('✅ 8. Raw ASIN input accepted and upper-cased.');

// 9. Unicode query searchLink
const unicodeSearch = searchLink('ESP32 WROOM माइक्रोकंट्रोलर', 'tech-triveni-21');
assert(unicodeSearch.startsWith('https://www.amazon.in/s?k='), 'Starts with amazon.in search');
assert(unicodeSearch.includes('tag=tech-triveni-21'), 'Includes tag');
console.log('✅ 9. Unicode search query handled correctly.');

// 10. Tag-change propagation test
const settingsA = { ...DEFAULT_AFFILIATE_SETTINGS, amazon_tag: 'tag-a-21' };
const settingsB = { ...DEFAULT_AFFILIATE_SETTINGS, amazon_tag: 'tag-b-21' };
const component = { name: 'ESP32 DevKit', store: 'Amazon' };
const verifiedLink = { status: 'verified', asin: 'B0716S5LQN' };

const renderedA = buildComponentAffiliateUrl(component, verifiedLink, settingsA);
const renderedB = buildComponentAffiliateUrl(component, verifiedLink, settingsB);

assert.strictEqual(renderedA.url, 'https://www.amazon.in/dp/B0716S5LQN?tag=tag-a-21');
assert.strictEqual(renderedB.url, 'https://www.amazon.in/dp/B0716S5LQN?tag=tag-b-21');
assert.notStrictEqual(renderedA.url, renderedB.url, 'Tag update propagates immediately');
console.log('✅ 10. Tag change propagation verified.');

// 11. Unverified / Broken link fallback to searchLink
const unverifiedLink = { status: 'unverified', asin: 'B0716S5LQN' };
const brokenLink = { status: 'broken', asin: 'B0716S5LQN' };
const renderedUnverified = buildComponentAffiliateUrl(component, unverifiedLink, settingsA);
const renderedBroken = buildComponentAffiliateUrl(component, brokenLink, settingsA);

assert.strictEqual(renderedUnverified.isDirectProduct, false);
assert.strictEqual(renderedUnverified.label, 'Search on Amazon');
assert.strictEqual(renderedUnverified.url, 'https://www.amazon.in/s?k=ESP32+DevKit&tag=tag-a-21');
assert.strictEqual(renderedBroken.isDirectProduct, false);
assert.strictEqual(renderedBroken.label, 'Search on Amazon');
console.log('✅ 11. Unverified & broken links safely fallback to Search on Amazon.');

console.log('\n🎉 ALL 11 AFFILIATE LINK BUILDER TESTS PASSED SUCCESSFULLY!\n');
