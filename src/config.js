/**
 * External API Configurations & Credentials
 */

export const API_KEYS = {
  LINK_PREVIEW: 'cd9bed6d9c4e22e5e3ea83b7c4554842',
  IP_GEOLOCATION: 'c818bbbba1954f2fba08acf5bc644f41',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_aAzZVe05dzPDhcYazkO_5g_FydypNDh'
};

const STORAGE_KEYS = {
  SUPABASE_URL: 'ith_supabase_url',
  ANALYTICS_EVENTS: 'ith_geo_analytics'
};

export function getSupabaseUrl() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
}

export function setSupabaseUrl(url) {
  if (typeof localStorage === 'undefined') return;
  if (url) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  }
}
