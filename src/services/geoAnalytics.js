/**
 * IPGeolocation Analytics Service
 * Tracks geographic location of link clicks and maintains anonymous visitor insights.
 */

import { API_KEYS } from '../config.js';

const STORAGE_KEY = 'ith_geo_click_events';
const SESSION_GEO_KEY = 'ith_session_visitor_geo';

let cachedLocation = null;

export async function getVisitorLocation() {
  if (cachedLocation) return cachedLocation;

  try {
    const sessionSaved = sessionStorage.getItem(SESSION_GEO_KEY);
    if (sessionSaved) {
      cachedLocation = JSON.parse(sessionSaved);
      return cachedLocation;
    }
  } catch (e) {
    // sessionStorage unavailable
  }

  try {
    const endpoint = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEYS.IP_GEOLOCATION}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.warn('IPGeolocation status:', response.status);
      return null;
    }
    const data = await response.json();
    cachedLocation = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code2 || 'UN',
      city: data.city || 'Unknown',
      flag: data.country_flag || ''
    };

    try {
      sessionStorage.setItem(SESSION_GEO_KEY, JSON.stringify(cachedLocation));
    } catch (e) {}

    return cachedLocation;
  } catch (err) {
    console.error('IPGeolocation fetch error:', err.message);
    return null;
  }
}

export async function recordClickEvent(link) {
  const geo = await getVisitorLocation();
  const event = {
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    linkId: link.id,
    linkTitle: link.title,
    platform: link.platform,
    country: geo?.country || 'Local/Unknown',
    countryCode: geo?.countryCode || '??',
    city: geo?.city || 'Local'
  };

  try {
    if (typeof localStorage !== 'undefined') {
      const events = getClickEvents();
      events.unshift(event);
      // Keep last 50 events
      const trimmed = events.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  } catch (e) {
    console.error('Failed to record click event:', e);
  }

  return event;
}

export function getClickEvents() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (e) {
    return [];
  }
}

export function getGeoStats() {
  const events = getClickEvents();
  const countryCounts = {};

  events.forEach(ev => {
    const key = ev.country || 'Unknown';
    countryCounts[key] = (countryCounts[key] || 0) + 1;
  });

  const sortedCountries = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalTracked: events.length,
    countries: sortedCountries,
    recentEvents: events.slice(0, 8),
    currentVisitor: cachedLocation
  };
}
