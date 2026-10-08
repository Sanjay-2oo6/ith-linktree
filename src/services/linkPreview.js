/**
 * LinkPreview API Integration
 * Fetches page title, description, and thumbnail image for any URL.
 */

import { API_KEYS } from '../config.js';

const cache = new Map();

export async function fetchLinkPreview(url) {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // Skip mailto and non-http links
  if (!/^https?:\/\//i.test(cleanUrl)) return null;

  if (cache.has(cleanUrl)) {
    return cache.get(cleanUrl);
  }

  try {
    const endpoint = `https://api.linkpreview.net/?key=${API_KEYS.LINK_PREVIEW}&q=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`LinkPreview API returned status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = {
      title: data.title || '',
      description: data.description || '',
      image: data.image || '',
      url: data.url || cleanUrl
    };

    cache.set(cleanUrl, result);
    return result;
  } catch (error) {
    console.error('LinkPreview fetch failed:', error.message);
    return null;
  }
}
