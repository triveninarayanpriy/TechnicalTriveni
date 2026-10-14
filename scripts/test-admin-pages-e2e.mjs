import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:8788';

async function main() {
  console.log('========================================================');
  console.log('🧪 RUNNING ADMIN PAGES (LIST & EDITOR) E2E ACCEPTANCE TESTS');
  console.log('========================================================');

  // --- 1. Admin Authentication ---
  console.log('\n--- 1. Authenticating Admin Session ---');
  const loginPageRes = await fetch(`${BASE_URL}/admin/login`);
  assert.equal(loginPageRes.status, 200, 'Login page should respond 200');
  const loginHtml = await loginPageRes.text();
  const loginCookies = loginPageRes.headers.get('set-cookie') || '';
  const adminCsrfMatch = loginHtml.match(/name="csrf"\s+value="([^"]+)"/);
  assert.ok(adminCsrfMatch, 'CSRF token must exist on login page');
  const adminCsrf = adminCsrfMatch[1];

  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': loginCookies,
    },
    body: new URLSearchParams({
      email: 'admin@technicaltriveni.com',
      password: 'triveni-admin-2026',
      csrf: adminCsrf,
    }),
    redirect: 'manual',
  });

  const sessionCookie = loginRes.headers.get('set-cookie') || '';
  const cookies = [loginCookies.split(';')[0], sessionCookie.split(';')[0]].filter(Boolean).join('; ');
  console.log('✓ Successfully authenticated admin session');

  // --- 2. Verify Admin Pages List (/admin/pages) ---
  console.log('\n--- 2. Verifying Redesigned Admin > Pages List ---');
  const pagesRes = await fetch(`${BASE_URL}/admin/pages`, {
    headers: { 'Cookie': cookies },
  });
  assert.equal(pagesRes.status, 200, '/admin/pages must respond 200');
  const pagesHtml = await pagesRes.text();

  // Verify explanation banner
  assert.ok(pagesHtml.includes('Pages with no custom text show the built-in site content'), 'Banner title must appear');
  assert.ok(pagesHtml.includes('Import all current content'), 'Import all current content button must appear');

  // Verify search and filter chips
  assert.ok(pagesHtml.includes('Search pages'), 'Search input must appear');
  assert.ok(pagesHtml.includes('All '), 'Filter pill "All" must appear');
  assert.ok(pagesHtml.includes('Info'), 'Filter pill "Info" must appear');
  assert.ok(pagesHtml.includes('Legal'), 'Filter pill "Legal" must appear');

  // Verify required pages exist in list
  const requiredPages = [
    'About',
    'Affiliate Disclosure',
    'Contact Us',
    'Cookie Policy',
    'Digital Delivery Policy',
    'Safety Disclaimer',
    'How It Works',
  ];
  for (const pageName of requiredPages) {
    assert.ok(pagesHtml.includes(pageName), `Pages list must contain "${pageName}"`);
  }
  console.log('✓ Admin > Pages list displays all 7 core pages with explanation banner and filter pills');

  // --- 3. Verify Editor Never Empty (/admin/pages/about) ---
  console.log('\n--- 3. Verifying Editor Content (/admin/pages/about) ---');
  const editAboutRes = await fetch(`${BASE_URL}/admin/pages/about`, {
    headers: { 'Cookie': cookies },
  });
  assert.equal(editAboutRes.status, 200, '/admin/pages/about must respond 200');
  const editAboutHtml = await editAboutRes.text();

  // Verify effective content loaded in textarea
  assert.ok(editAboutHtml.includes('Real builds. Tested on the workbench.'), 'Editor textarea must contain built-in default content (never empty)');
  assert.ok(editAboutHtml.includes('Triveni'), 'Textarea must include maker biography');
  assert.ok(editAboutHtml.includes('Built-in site content') || editAboutHtml.includes('Custom content'), 'Content source chip must appear');
  assert.ok(editAboutHtml.includes('Reset to default'), 'Reset to default button must appear');
  assert.ok(editAboutHtml.includes('Live preview'), 'Live preview section must appear');
  assert.ok(editAboutHtml.includes('History'), 'History revision card must appear');
  console.log('✓ Editor correctly loads effective content, source badge, live preview, and history');

  // --- 4. Test "Import all current content" API ---
  console.log('\n--- 4. Testing "Import all current content" Endpoint ---');
  const authCsrfMatch = editAboutHtml.match(/name="csrf"\s+value="([^"]+)"/);
  assert.ok(authCsrfMatch, 'CSRF token required in editor');
  const authCsrf = authCsrfMatch[1];

  const importRes = await fetch(`${BASE_URL}/api/admin/page/import-all`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Cookie': cookies,
    },
    body: new URLSearchParams({ csrf: authCsrf }),
  });
  assert.equal(importRes.status, 200, 'Import all API should respond 200');
  const importData = await importRes.json();
  console.log('Import API response:', importData);
  assert.equal(importData.ok, true, 'Import API must succeed');
  assert.ok(typeof importData.imported === 'number', 'Imported count must be number');
  assert.ok(typeof importData.skipped === 'number', 'Skipped count must be number');
  console.log(`✓ Import all succeeded: ${importData.imported} imported, ${importData.skipped} skipped`);

  // --- 5. Verify Idempotency of Import ---
  console.log('\n--- 5. Verifying Idempotency of Import ---');
  const reimportRes = await fetch(`${BASE_URL}/api/admin/page/import-all`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Cookie': cookies,
    },
    body: new URLSearchParams({ csrf: authCsrf }),
  });
  const reimportData = await reimportRes.json();
  assert.equal(reimportData.imported, 0, 'Second import must import 0 rows');
  assert.ok(reimportData.skipped > 0, 'Second import must skip all existing custom pages');
  console.log('✓ Idempotency verified: 0 imported on re-run');

  // --- 6. Test Saving Custom Content & Live Verification ---
  console.log('\n--- 6. Testing Custom Edit & Live Propagation ---');
  const customHeading = 'Workbench Innovation Lab 2026';
  const customBio = `## ${customHeading}\n\nTesting live markdown editing propagation for the About page.`;

  const saveRes = await fetch(`${BASE_URL}/api/admin/page/save`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Cookie': cookies,
    },
    body: new URLSearchParams({
      csrf: authCsrf,
      slug: 'about',
      title: 'About',
      content_md: customBio,
      published: '1',
      meta_title: 'About Triveni - Workbench Innovation',
      meta_description: 'Custom bio description for search engines.',
    }),
  });
  assert.equal(saveRes.status, 200, 'Save API should respond 200');
  const saveData = await saveRes.json();
  assert.equal(saveData.ok, true, 'Save must succeed');
  console.log('✓ Custom page saved in database');

  // Verify live /about reflects the change
  const liveAboutRes = await fetch(`${BASE_URL}/about`);
  assert.equal(liveAboutRes.status, 200);
  const liveAboutHtml = await liveAboutRes.text();
  assert.ok(liveAboutHtml.includes(customHeading), 'Live /about page must reflect newly saved custom heading');
  assert.ok(liveAboutHtml.includes('Testing live markdown editing propagation'), 'Live /about must reflect custom bio text');
  console.log('✓ Live public /about verified with updated custom content!');

  // --- 7. Test "Reset to default" ---
  console.log('\n--- 7. Testing "Reset to default" Endpoint ---');
  const resetRes = await fetch(`${BASE_URL}/api/admin/page/reset`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Cookie': cookies,
    },
    body: new URLSearchParams({
      csrf: authCsrf,
      slug: 'about',
    }),
  });
  assert.equal(resetRes.status, 200, 'Reset API should respond 200');
  const resetData = await resetRes.json();
  assert.equal(resetData.ok, true, 'Reset must succeed');
  console.log('✓ Reset API succeeded');

  // Verify live /about returns to built-in default
  const resetLiveRes = await fetch(`${BASE_URL}/about`);
  const resetLiveHtml = await resetLiveRes.text();
  assert.ok(resetLiveHtml.includes('Real builds. Tested on the workbench.'), 'Live /about must return to default built-in text');
  console.log('✓ Live public /about verified returned to built-in default content!');

  // --- 8. Test Legal Routes & Top-Level Aliases ---
  console.log('\n--- 8. Testing Legal Routes and URL Aliases ---');
  const affiliateAliasRes = await fetch(`${BASE_URL}/affiliate`, { redirect: 'manual' });
  assert.equal(affiliateAliasRes.status, 301, '/affiliate should redirect 301');
  assert.equal(affiliateAliasRes.headers.get('location'), '/legal/affiliate');

  const legalAffiliateRes = await fetch(`${BASE_URL}/legal/affiliate`);
  assert.equal(legalAffiliateRes.status, 200, '/legal/affiliate should respond 200');
  const legalAffiliateHtml = await legalAffiliateRes.text();
  assert.ok(legalAffiliateHtml.includes('Affiliate Disclosure'), 'Affiliate page must contain title');
  assert.ok(legalAffiliateHtml.includes('Technical Triveni participates in various affiliate marketing programs'), 'Affiliate disclosure default must render');
  console.log('✓ Top-level alias /affiliate -> /legal/affiliate and content verified!');

  console.log('\n========================================================');
  console.log('🎉 ALL ADMIN PAGES FIX & REDESIGN CRITERIA PASSED 100%!');
  console.log('========================================================');
}

main().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
