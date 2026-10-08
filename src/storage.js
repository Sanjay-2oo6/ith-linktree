/**
 * Storage Layer for Brutalist Linktree Clone
 * Handles localStorage persistence and provides clean APIs for state mutations.
 */

import { detectPlatformFromUrl } from './detector.js';

const STORAGE_KEYS = {
  PROFILE: 'ith_linktree_profile',
  LINKS: 'ith_linktree_links'
};

export const DEFAULT_PROFILE = {
  title: 'ALL OFFICIAL LINKS & SOCIAL CHANNELS',
  handle: '@INNOTECH_HUB',
  bio: 'Every project, social profile, community server, and documentation repo in one command center.'
};

export const INITIAL_LINKS = [
  {
    id: 'link_01',
    title: 'Open-Source Repositories',
    url: 'https://github.com/innotech-hub',
    platform: 'GitHub',
    icon: 'fa-brands fa-github',
    category: 'CODE',
    featured: true,
    clicks: 1420,
    order: 1,
    active: true
  },
  {
    id: 'link_02',
    title: 'Official Innotech Hub Website',
    url: 'https://innotechhub.in',
    platform: 'Website',
    icon: 'fa-solid fa-globe',
    category: 'WEB',
    featured: true,
    clicks: 980,
    order: 2,
    active: true
  },
  {
    id: 'link_03',
    title: 'Instagram',
    url: 'https://www.instagram.com/innotechhub.official/',
    platform: 'Instagram',
    icon: 'fa-brands fa-instagram',
    category: 'SOCIAL',
    featured: false,
    clicks: 760,
    order: 3,
    active: true
  },
  {
    id: 'link_04',
    title: 'LinkedIn Company Page',
    url: 'https://www.linkedin.com/company/innotechhub-official',
    platform: 'LinkedIn',
    icon: 'fa-brands fa-linkedin',
    category: 'SOCIAL',
    featured: false,
    clicks: 615,
    order: 4,
    active: true
  },
  {
    id: 'link_05',
    title: 'YouTube Channel & Media',
    url: 'https://www.youtube.com/@innotechhub.official',
    platform: 'YouTube',
    icon: 'fa-brands fa-youtube',
    category: 'MEDIA',
    featured: false,
    clicks: 540,
    order: 5,
    active: true
  },
  {
    id: 'link_06',
    title: 'X (Twitter) Updates',
    url: 'https://x.com/InnotechH93449',
    platform: 'X / Twitter',
    icon: 'fa-brands fa-x-twitter',
    category: 'SOCIAL',
    featured: false,
    clicks: 430,
    order: 6,
    active: true
  },
  {
    id: 'link_07',
    title: 'Official Discord Community',
    url: 'https://discord.gg/innotechhub',
    platform: 'Discord',
    icon: 'fa-brands fa-discord',
    category: 'COMMUNITY',
    featured: false,
    clicks: 890,
    order: 7,
    active: true
  },
  {
    id: 'link_08',
    title: 'Direct Developer Inquiries',
    url: 'mailto:contact@innotechhub.in',
    platform: 'Email',
    icon: 'fa-solid fa-envelope',
    category: 'COMMUNITY',
    featured: false,
    clicks: 210,
    order: 8,
    active: true
  }
];

export function getProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return { ...DEFAULT_PROFILE };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading profile from localStorage:', e);
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to localStorage:', e);
  }
}

export function getLinks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINKS);
    if (!raw) {
      saveLinks(INITIAL_LINKS);
      return [...INITIAL_LINKS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveLinks(INITIAL_LINKS);
      return [...INITIAL_LINKS];
    }
    // Sort by order ascending
    return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (e) {
    console.error('Error loading links from localStorage:', e);
    return [...INITIAL_LINKS];
  }
}

export function saveLinks(links) {
  try {
    // Normalise ordering
    const normalized = links.map((link, idx) => ({
      ...link,
      order: idx + 1
    }));
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(normalized));
    return normalized;
  } catch (e) {
    console.error('Error saving links to localStorage:', e);
    return links;
  }
}

export function addLink({ title, url, featured = false }) {
  const links = getLinks();
  const detection = detectPlatformFromUrl(url);

  const newLink = {
    id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    url: url.trim(),
    platform: detection.platform,
    icon: detection.icon,
    category: detection.category,
    featured: Boolean(featured),
    clicks: 0,
    order: links.length + 1,
    active: true
  };

  const updatedLinks = [...links, newLink];
  saveLinks(updatedLinks);
  return newLink;
}

export function updateLink(id, updateData) {
  const links = getLinks();
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return null;

  const current = links[index];
  const urlChanged = updateData.url && updateData.url.trim() !== current.url;
  const detection = urlChanged ? detectPlatformFromUrl(updateData.url) : {};

  links[index] = {
    ...current,
    ...updateData,
    ...(urlChanged ? {
      platform: detection.platform,
      icon: detection.icon,
      category: detection.category
    } : {})
  };

  saveLinks(links);
  return links[index];
}

export function deleteLink(id) {
  const links = getLinks();
  const filtered = links.filter(l => l.id !== id);
  return saveLinks(filtered);
}

export function moveLink(id, direction) {
  const links = getLinks();
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return links;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= links.length) {
    return links; // Cannot move beyond boundaries
  }

  // Swap
  const temp = links[index];
  links[index] = links[targetIndex];
  links[targetIndex] = temp;

  return saveLinks(links);
}

export function toggleFeatured(id) {
  const links = getLinks();
  const link = links.find(l => l.id === id);
  if (link) {
    link.featured = !link.featured;
    saveLinks(links);
  }
  return links;
}

export function incrementClicks(id) {
  const links = getLinks();
  const link = links.find(l => l.id === id);
  if (link) {
    link.clicks = (Number(link.clicks) || 0) + 1;
    saveLinks(links);
    return link.clicks;
  }
  return 0;
}

export function resetToDefault() {
  saveProfile(DEFAULT_PROFILE);
  return saveLinks(INITIAL_LINKS);
}
