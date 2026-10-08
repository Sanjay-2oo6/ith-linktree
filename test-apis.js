/**
 * Test Suite for Live API Integrations
 * Tests LinkPreview, IPGeolocation, and Supabase modules
 */

const memStorage = new Map();
global.localStorage = {
  getItem: (k) => memStorage.get(k) || null,
  setItem: (k, v) => memStorage.set(k, String(v)),
  removeItem: (k) => memStorage.delete(k)
};

import { fetchLinkPreview } from './src/services/linkPreview.js';
import { getVisitorLocation, recordClickEvent, getGeoStats } from './src/services/geoAnalytics.js';
import { getSupabase, isSupabaseConnected } from './src/services/supabaseClient.js';
import { API_KEYS, setSupabaseUrl, getSupabaseUrl } from './src/config.js';

console.log('====================================================');
console.log('TESTING LIVE API INTEGRATIONS');
console.log('====================================================\n');

async function runApiTests() {
  let passed = 0;
  let total = 0;

  function assert(condition, desc) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${desc}`);
      process.exitCode = 1;
    }
  }

  // 1. LinkPreview API
  console.log('--- 1. Testing LinkPreview API ---');
  assert(Boolean(API_KEYS.LINK_PREVIEW), 'LinkPreview API key configured');
  const preview = await fetchLinkPreview('https://innotechhub.in');
  assert(preview !== null, 'LinkPreview returned response for https://innotechhub.in');
  assert(Boolean(preview?.title), `LinkPreview returned page title: "${preview?.title}"`);

  // 2. IPGeolocation API
  console.log('\n--- 2. Testing IPGeolocation API ---');
  assert(Boolean(API_KEYS.IP_GEOLOCATION), 'IPGeolocation API key configured');
  const location = await getVisitorLocation();
  assert(location !== null, 'IPGeolocation returned visitor location');
  assert(Boolean(location?.country), `Detected visitor country: "${location?.country}" (${location?.countryCode})`);

  // Test recording a geo click event
  const mockLink = { id: 'link_test', title: 'Test Geo Link', platform: 'Website' };
  const recorded = await recordClickEvent(mockLink);
  assert(recorded.country === location.country, `Click event recorded with visitor country: ${recorded.country}`);

  const stats = getGeoStats();
  assert(stats.totalTracked >= 1, `Geo analytics aggregated click count: ${stats.totalTracked}`);
  assert(stats.countries.length >= 1, `Geo analytics found country: ${stats.countries[0]?.country}`);

  // 3. Supabase Client
  console.log('\n--- 3. Testing Supabase Configuration ---');
  assert(Boolean(API_KEYS.SUPABASE_PUBLISHABLE_KEY), 'Supabase publishable key configured');
  assert(!isSupabaseConnected(), 'Supabase is initially in local sync mode (awaiting project URL)');

  setSupabaseUrl('https://example-project.supabase.co');
  assert(getSupabaseUrl() === 'https://example-project.supabase.co', 'Supabase project URL saved to config');
  assert(isSupabaseConnected(), 'Supabase connected status is true when URL is set');
  const client = getSupabase();
  assert(client !== null, 'Supabase JS client instantiated successfully');

  // Reset to default
  setSupabaseUrl('');

  console.log('\n====================================================');
  console.log(`API TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log('====================================================\n');
}

runApiTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
