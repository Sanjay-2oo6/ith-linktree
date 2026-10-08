/**
 * Comprehensive Automated End-to-End Verification Test Suite
 * Tests all requirements from Project Handoff Document
 */

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const htmlContent = fs.readFileSync(path.resolve('./index.html'), 'utf-8');

console.log('====================================================');
console.log('STARTING COMPREHENSIVE NEO-BRUTALIST LINK HUB TESTS');
console.log('====================================================\n');

async function runTests() {
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName) {
    totalCount++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Setup JSDOM environment
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:5173/',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  const { window } = dom;
  const { document } = window;
  global.window = window;
  global.document = document;
  global.localStorage = window.localStorage;

  // 2. Test URL Detection Logic independently
  const { detectPlatformFromUrl } = await import('./src/detector.js');

  console.log('--- TEST GROUP 1: URL & DOMAIN DETECTION ---');
  const detectionTests = [
    { url: 'https://github.com/innotech-hub', platform: 'GitHub', cat: 'CODE', icon: 'fa-brands fa-github' },
    { url: 'https://linkedin.com/company/innotechhub-official', platform: 'LinkedIn', cat: 'SOCIAL', icon: 'fa-brands fa-linkedin' },
    { url: 'https://x.com/InnotechH93449', platform: 'X / Twitter', cat: 'SOCIAL', icon: 'fa-brands fa-x-twitter' },
    { url: 'https://twitter.com/InnotechH93449', platform: 'X / Twitter', cat: 'SOCIAL', icon: 'fa-brands fa-x-twitter' },
    { url: 'https://www.instagram.com/innotechhub.official/', platform: 'Instagram', cat: 'SOCIAL', icon: 'fa-brands fa-instagram' },
    { url: 'https://www.youtube.com/@innotechhub.official', platform: 'YouTube', cat: 'MEDIA', icon: 'fa-brands fa-youtube' },
    { url: 'https://youtu.be/video123', platform: 'YouTube', cat: 'MEDIA', icon: 'fa-brands fa-youtube' },
    { url: 'https://discord.gg/innotechhub', platform: 'Discord', cat: 'COMMUNITY', icon: 'fa-brands fa-discord' },
    { url: 'https://discord.com/invite/innotech', platform: 'Discord', cat: 'COMMUNITY', icon: 'fa-brands fa-discord' },
    { url: 'https://whatsapp.com/channel/abc', platform: 'WhatsApp', cat: 'COMMUNITY', icon: 'fa-brands fa-whatsapp' },
    { url: 'https://wa.me/919999999999', platform: 'WhatsApp', cat: 'COMMUNITY', icon: 'fa-brands fa-whatsapp' },
    { url: 'https://t.me/innotechhub', platform: 'Telegram', cat: 'COMMUNITY', icon: 'fa-brands fa-telegram' },
    { url: 'https://telegram.org/dl', platform: 'Telegram', cat: 'COMMUNITY', icon: 'fa-brands fa-telegram' },
    { url: 'https://spotify.com/episode/123', platform: 'Spotify', cat: 'MEDIA', icon: 'fa-brands fa-spotify' },
    { url: 'https://figma.com/@innotechhub', platform: 'Figma', cat: 'CODE', icon: 'fa-brands fa-figma' },
    { url: 'https://medium.com/@innotechhub', platform: 'Medium', cat: 'SOCIAL', icon: 'fa-brands fa-medium' },
    { url: 'https://reddit.com/r/technology', platform: 'Reddit', cat: 'COMMUNITY', icon: 'fa-brands fa-reddit' },
    { url: 'mailto:contact@innotechhub.in', platform: 'Email', cat: 'COMMUNITY', icon: 'fa-solid fa-envelope' },
    { url: 'https://innotechhub.in', platform: 'Website', cat: 'WEB', icon: 'fa-solid fa-globe' }
  ];

  for (const t of detectionTests) {
    const res = detectPlatformFromUrl(t.url);
    assert(
      res.platform === t.platform && res.category === t.cat && res.icon === t.icon,
      `URL detection for "${t.url}" -> ${res.platform} [${res.category}]`
    );
  }

  // 3. Test Storage Layer
  console.log('\n--- TEST GROUP 2: STORAGE & SEED DATA ---');
  const storage = await import('./src/storage.js');
  const initialLinks = storage.getLinks();
  assert(initialLinks.length >= 8, `Initial links loaded with count: ${initialLinks.length}`);

  const hasInstagram = initialLinks.some(l => l.url.includes('instagram.com/innotechhub.official'));
  const hasX = initialLinks.some(l => l.url.includes('x.com/InnotechH93449'));
  const hasYouTube = initialLinks.some(l => l.url.includes('youtube.com/@innotechhub.official'));
  const hasLinkedIn = initialLinks.some(l => l.url.includes('linkedin.com/company/innotechhub-official'));
  const hasWebsite = initialLinks.some(l => l.url.includes('innotechhub.in'));

  assert(hasInstagram, 'Official Instagram URL present in seed data');
  assert(hasX, 'Official X URL present in seed data');
  assert(hasYouTube, 'Official YouTube URL present in seed data');
  assert(hasLinkedIn, 'Official LinkedIn URL present in seed data');
  assert(hasWebsite, 'Official Website URL present in seed data');

  // 4. Test Application Initialization and UI Rendering
  console.log('\n--- TEST GROUP 3: APPLICATION INIT & DOM RENDERING ---');
  const app = await import('./src/app.js');
  app.init();

  const tickerActive = document.getElementById('stat-active-links');
  const tickerClicks = document.getElementById('stat-total-clicks');
  const tickerPlatforms = document.getElementById('stat-platforms');
  const heroBadge = document.getElementById('hero-badge');
  const heroTitle = document.getElementById('hero-title');
  const heroBio = document.getElementById('hero-bio');
  const heroHandle = document.getElementById('hero-handle');

  assert(Number(tickerActive.textContent) === initialLinks.length, `Ticker Active Links displays ${tickerActive.textContent}`);
  assert(Number(tickerClicks.textContent.replace(/,/g, '')) > 0, `Ticker Total Clicks displays ${tickerClicks.textContent}`);
  assert(Number(tickerPlatforms.textContent) >= 5, `Ticker Platforms displays ${tickerPlatforms.textContent}`);
  assert(heroBadge.textContent.includes('OFFICIAL LINK HUB'), 'Hero badge has "OFFICIAL LINK HUB"');
  assert(heroTitle.textContent.includes('ALL OFFICIAL LINKS & SOCIAL CHANNELS'), 'Hero title matches specification');
  assert(heroHandle.textContent.includes('@INNOTECH_HUB'), 'Hero handle matches specification');

  const adminRows = document.querySelectorAll('.admin-link-row');
  assert(adminRows.length === initialLinks.length, `Admin list renders ${adminRows.length} link rows`);

  const publicCards = document.querySelectorAll('.link-card');
  assert(publicCards.length === initialLinks.length, `Public grid renders ${publicCards.length} cards`);

  // 5. Test Live URL Detection in the Form
  console.log('\n--- TEST GROUP 4: REAL-TIME URL DETECTION IN FORM ---');
  const inputUrl = document.getElementById('input-link-url');
  const detectedPlatform = document.getElementById('detected-platform-name');
  const detectedCategory = document.getElementById('detected-category-name');
  const detectedIcon = document.getElementById('detected-icon-preview');

  inputUrl.value = 'https://discord.gg/gamerzone';
  inputUrl.dispatchEvent(new window.Event('input'));
  assert(detectedPlatform.textContent === 'Discord', `Real-time typing detected platform "Discord"`);
  assert(detectedCategory.textContent === 'COMMUNITY', `Real-time typing detected category "COMMUNITY"`);
  assert(detectedIcon.className.includes('fa-discord'), `Real-time typing updated icon to fa-discord`);

  inputUrl.value = 'mailto:press@innotechhub.in';
  inputUrl.dispatchEvent(new window.Event('input'));
  assert(detectedPlatform.textContent === 'Email', `Real-time typing detected platform "Email"`);
  assert(detectedCategory.textContent === 'COMMUNITY', `Real-time typing detected category "COMMUNITY"`);

  inputUrl.value = 'https://customsite.io/awesome';
  inputUrl.dispatchEvent(new window.Event('input'));
  assert(detectedPlatform.textContent === 'Website', `Real-time typing detected platform fallback "Website"`);
  assert(detectedCategory.textContent === 'WEB', `Real-time typing detected category fallback "WEB"`);

  // 6. Test Adding a New Link via Admin Console
  console.log('\n--- TEST GROUP 5: ADMIN ADD LINK ---');
  const inputTitle = document.getElementById('input-link-title');
  const inputFeatured = document.getElementById('input-link-featured');
  const adminForm = document.getElementById('admin-link-form');

  inputTitle.value = 'Figma Design System';
  inputUrl.value = 'https://figma.com/@innotech-design';
  inputFeatured.checked = true;
  adminForm.dispatchEvent(new window.Event('submit'));

  const updatedAdminRows = document.querySelectorAll('.admin-link-row');
  assert(updatedAdminRows.length === initialLinks.length + 1, `Admin row count increased to ${updatedAdminRows.length}`);

  const updatedPublicCards = document.querySelectorAll('.link-card');
  assert(updatedPublicCards.length === initialLinks.length + 1, `Public cards count increased to ${updatedPublicCards.length}`);

  const figmaCard = Array.from(updatedPublicCards).find(c => c.textContent.includes('Figma Design System'));
  assert(Boolean(figmaCard), 'Newly added Figma card exists in public grid');
  assert(figmaCard.classList.contains('is-featured'), 'Newly added Figma card has .is-featured class');
  assert(figmaCard.innerHTML.includes('FEATURED SPOTLIGHT'), 'Newly added Figma card displays FEATURED SPOTLIGHT banner');

  // 7. Test Search Links Input
  console.log('\n--- TEST GROUP 6: SEARCH & FILTER ---');
  const searchInput = document.getElementById('search-input');
  searchInput.value = 'Design System';
  searchInput.dispatchEvent(new window.Event('input'));

  const visibleCardsAfterSearch = Array.from(document.querySelectorAll('.link-card')).filter(c => c.style.display !== 'none');
  assert(visibleCardsAfterSearch.length === 1, `Search filters grid to 1 matching card`);
  assert(visibleCardsAfterSearch[0].textContent.includes('Figma Design System'), 'Search result matches "Figma Design System"');

  // Clear search
  const btnClearSearch = document.getElementById('btn-clear-search');
  btnClearSearch.click();
  const restoredCards = document.querySelectorAll('.link-card');
  assert(restoredCards.length === initialLinks.length + 1, `Search reset restored all ${restoredCards.length} cards`);

  // Category Tabs filter
  const catBtnMedia = document.querySelector('.category-filter-btn[data-category="MEDIA"]');
  catBtnMedia.click();
  const mediaCards = document.querySelectorAll('.link-card');
  assert(mediaCards.length >= 1, `MEDIA filter returned ${mediaCards.length} cards`);
  const allMedia = Array.from(mediaCards).every(c => c.textContent.includes('MEDIA') || c.textContent.includes('YouTube') || c.textContent.includes('Spotify'));
  assert(allMedia, 'All displayed cards belong to MEDIA category');

  // Restore All Links
  const catBtnAll = document.querySelector('.category-filter-btn[data-category="ALL"]');
  catBtnAll.click();
  assert(document.querySelectorAll('.link-card').length === initialLinks.length + 1, 'ALL LINKS filter restored all cards');

  // 8. Test Click Tracking Counter
  console.log('\n--- TEST GROUP 7: CLICK COUNTER ---');
  const initialTickerTotal = Number(tickerClicks.textContent.replace(/,/g, ''));
  const firstCard = document.querySelector('.link-card');
  const cardClickPillBefore = firstCard.querySelector('.clicks-pill').textContent;
  
  firstCard.click();
  
  const cardClickPillAfter = firstCard.querySelector('.clicks-pill').textContent;
  const updatedTickerTotal = Number(tickerClicks.textContent.replace(/,/g, ''));
  
  assert(updatedTickerTotal === initialTickerTotal + 1, `Total clicks in ticker incremented by 1 (${initialTickerTotal} -> ${updatedTickerTotal})`);

  // 9. Test Reordering (Move Down & Move Up)
  console.log('\n--- TEST GROUP 8: REORDERING ---');
  const firstAdminRow = document.querySelector('.admin-link-row');
  const firstId = firstAdminRow.dataset.id;
  const btnDown = firstAdminRow.querySelector('.btn-down');
  
  btnDown.click();
  const newSecondAdminRow = document.querySelectorAll('.admin-link-row')[1];
  assert(newSecondAdminRow.dataset.id === firstId, `Link successfully moved down to position #2`);

  const btnUp = newSecondAdminRow.querySelector('.btn-up');
  btnUp.click();
  const restoredFirstAdminRow = document.querySelectorAll('.admin-link-row')[0];
  assert(restoredFirstAdminRow.dataset.id === firstId, `Link successfully moved back up to position #1`);

  // 10. Test Featured Star Toggle
  console.log('\n--- TEST GROUP 9: FEATURED TOGGLE ---');
  const targetRow = document.querySelectorAll('.admin-link-row')[2];
  const targetId = targetRow.dataset.id;
  const starBtn = targetRow.querySelector('.btn-star');
  const wasFeatured = targetRow.classList.contains('is-featured');
  
  starBtn.click();
  const targetRowAfter = document.querySelector(`.admin-link-row[data-id="${targetId}"]`);
  assert(targetRowAfter.classList.contains('is-featured') === !wasFeatured, 'Featured status toggled on Admin row');
  
  const publicCardAfter = document.querySelector(`.link-card[data-id="${targetId}"]`);
  assert(publicCardAfter.classList.contains('is-featured') === !wasFeatured, 'Featured status toggled on Public link card');

  // 11. Test Edit Link
  console.log('\n--- TEST GROUP 10: EDIT LINK ---');
  const editRow = document.querySelectorAll('.admin-link-row')[updatedAdminRows.length - 1];
  const editId = editRow.dataset.id;
  const editBtn = editRow.querySelector('.btn-edit');
  
  editBtn.click();
  assert(inputTitle.value === 'Figma Design System', 'Edit populated Title into input field');
  assert(document.getElementById('edit-link-id').value === editId, 'Edit populated link ID');

  inputTitle.value = 'Innotech Official Figma UI Kit';
  adminForm.dispatchEvent(new window.Event('submit'));

  const editedCard = document.querySelector(`.link-card[data-id="${editId}"]`);
  assert(editedCard.textContent.includes('Innotech Official Figma UI Kit'), 'Public card reflects updated title');

  // 12. Test Neo-Brutalist Confirmation Modal Deletion
  console.log('\n--- TEST GROUP 11: NEO-BRUTALIST MODAL DELETION ---');
  const deleteRow = document.querySelector(`.admin-link-row[data-id="${editId}"]`);
  const delBtn = deleteRow.querySelector('.btn-del');
  
  delBtn.click();
  const modalBackdrop = document.getElementById('brutal-modal-backdrop');
  assert(modalBackdrop.style.display === 'flex', 'Brutalist confirmation modal opened on delete click');
  assert(document.getElementById('modal-title').textContent === 'DELETE LINK', 'Modal title is "DELETE LINK"');

  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  modalConfirmBtn.click();

  assert(modalBackdrop.style.display === 'none', 'Modal closed after confirming delete');
  const deletedRowCheck = document.querySelector(`.admin-link-row[data-id="${editId}"]`);
  const deletedCardCheck = document.querySelector(`.link-card[data-id="${editId}"]`);
  assert(!deletedRowCheck, 'Item successfully removed from Admin Console');
  assert(!deletedCardCheck, 'Item successfully removed from Public Link Hub');

  // 13. Test View Modes
  console.log('\n--- TEST GROUP 12: VIEW MODES ---');
  const appWrapper = document.getElementById('app-wrapper');
  const btnPublic = document.getElementById('view-mode-public');
  const btnAdmin = document.getElementById('view-mode-admin');
  const btnSplit = document.getElementById('view-mode-split');

  btnPublic.click();
  assert(appWrapper.classList.contains('view-public-only'), 'Switched to Public Hub only view');

  btnAdmin.click();
  assert(appWrapper.classList.contains('view-admin-only'), 'Switched to Admin Console only view');

  btnSplit.click();
  assert(!appWrapper.classList.contains('view-public-only') && !appWrapper.classList.contains('view-admin-only'), 'Switched back to Split View');

  // 14. Test Studio Navigation Tabs & Mobile Canvas
  console.log('\n--- TEST GROUP 13: STUDIO NAVIGATION TABS & PHONE CANVAS ---');
  const tabLinks = document.querySelector('.studio-tab-btn[data-tab="links"]');
  const tabGeo = document.querySelector('.studio-tab-btn[data-tab="geo"]');
  const tabCloud = document.querySelector('.studio-tab-btn[data-tab="cloud"]');

  const paneLinks = document.getElementById('pane-links');
  const paneGeo = document.getElementById('pane-geo');
  const paneCloud = document.getElementById('pane-cloud');

  assert(tabLinks && tabGeo && tabCloud, 'All 3 Studio Tabs exist');
  assert(paneLinks && paneGeo && paneCloud, 'All 3 Studio Panes exist');
  assert(tabLinks.classList.contains('active'), 'Links tab active by default');
  assert(paneLinks.classList.contains('active'), 'Links pane active by default');

  tabGeo.click();
  assert(tabGeo.classList.contains('active'), 'Geo Analytics tab active after click');
  assert(paneGeo.classList.contains('active'), 'Geo Analytics pane displayed after click');
  assert(!paneLinks.classList.contains('active'), 'Links pane hidden when Geo active');

  tabCloud.click();
  assert(tabCloud.classList.contains('active'), 'Supabase tab active after click');
  assert(paneCloud.classList.contains('active'), 'Supabase pane displayed after click');

  tabLinks.click();
  assert(tabLinks.classList.contains('active'), 'Returned to Links tab');
  assert(paneLinks.classList.contains('active'), 'Links pane visible again');

  const phoneFrame = document.querySelector('.device-phone-frame');
  const phoneNotch = document.querySelector('.phone-speaker-notch');
  const phoneScroll = document.querySelector('.phone-inner-scroll');
  assert(phoneFrame !== null, 'Realistic Smartphone Frame mockup exists');
  assert(phoneNotch !== null, 'Smartphone Speaker & Sensor Notch exists');
  assert(phoneScroll !== null, 'Phone Inner Scrollable Viewport exists');
  assert(phoneScroll.contains(document.getElementById('hero-box')), 'Phone Canvas contains Hero Box');
  assert(phoneScroll.contains(document.getElementById('links-grid')), 'Phone Canvas contains Links Grid');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedCount === totalCount) {
    console.log('🎉 ALL SPECIFICATIONS VERIFIED AND SATISFIED!');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
