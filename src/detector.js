/**
 * Automatic URL-to-Icon and Category Detection Logic
 * Conforms to Specification:
 * - Detects platform, FontAwesome 6 icon class, and category
 * - Supports all domain variations (x.com / twitter.com, youtu.be / youtube.com, etc.)
 * - Handles mailto: protocol
 * - Fallbacks gracefully to Website (WEB)
 */

export function detectPlatformFromUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      platform: 'Website',
      icon: 'fa-solid fa-globe',
      category: 'WEB'
    };
  }

  const urlLower = rawUrl.trim().toLowerCase();
  if (urlLower === '') {
    return {
      platform: 'Website',
      icon: 'fa-solid fa-globe',
      category: 'WEB'
    };
  }

  // Check mailto first
  if (urlLower.startsWith('mailto:') || urlLower.includes('mailto:')) {
    return {
      platform: 'Email',
      icon: 'fa-solid fa-envelope',
      category: 'COMMUNITY'
    };
  }

  // GitHub (CODE)
  if (urlLower.includes('github.com') || urlLower.includes('github')) {
    return {
      platform: 'GitHub',
      icon: 'fa-brands fa-github',
      category: 'CODE'
    };
  }

  // LinkedIn (SOCIAL)
  if (urlLower.includes('linkedin.com') || urlLower.includes('linkedin')) {
    return {
      platform: 'LinkedIn',
      icon: 'fa-brands fa-linkedin',
      category: 'SOCIAL'
    };
  }

  // X / Twitter (SOCIAL)
  if (
    urlLower.includes('x.com') ||
    urlLower.includes('twitter.com') ||
    urlLower.includes('twitter') ||
    /(?:^|\/\/|\.)x\.com/.test(urlLower)
  ) {
    return {
      platform: 'X / Twitter',
      icon: 'fa-brands fa-x-twitter',
      category: 'SOCIAL'
    };
  }

  // Instagram (SOCIAL)
  if (urlLower.includes('instagram.com') || urlLower.includes('instagram')) {
    return {
      platform: 'Instagram',
      icon: 'fa-brands fa-instagram',
      category: 'SOCIAL'
    };
  }

  // YouTube (MEDIA)
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || urlLower.includes('youtube')) {
    return {
      platform: 'YouTube',
      icon: 'fa-brands fa-youtube',
      category: 'MEDIA'
    };
  }

  // Discord (COMMUNITY)
  if (urlLower.includes('discord.gg') || urlLower.includes('discord.com') || urlLower.includes('discord')) {
    return {
      platform: 'Discord',
      icon: 'fa-brands fa-discord',
      category: 'COMMUNITY'
    };
  }

  // WhatsApp (COMMUNITY)
  if (urlLower.includes('whatsapp.com') || urlLower.includes('wa.me') || urlLower.includes('whatsapp')) {
    return {
      platform: 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      category: 'COMMUNITY'
    };
  }

  // Telegram (COMMUNITY)
  if (urlLower.includes('t.me') || urlLower.includes('telegram.org') || urlLower.includes('telegram')) {
    return {
      platform: 'Telegram',
      icon: 'fa-brands fa-telegram',
      category: 'COMMUNITY'
    };
  }

  // Spotify (MEDIA)
  if (urlLower.includes('spotify.com') || urlLower.includes('spotify')) {
    return {
      platform: 'Spotify',
      icon: 'fa-brands fa-spotify',
      category: 'MEDIA'
    };
  }

  // Figma (CODE)
  if (urlLower.includes('figma.com') || urlLower.includes('figma')) {
    return {
      platform: 'Figma',
      icon: 'fa-brands fa-figma',
      category: 'CODE'
    };
  }

  // Medium (SOCIAL)
  if (urlLower.includes('medium.com')) {
    return {
      platform: 'Medium',
      icon: 'fa-brands fa-medium',
      category: 'SOCIAL'
    };
  }

  // Reddit (COMMUNITY)
  if (urlLower.includes('reddit.com') || urlLower.includes('reddit')) {
    return {
      platform: 'Reddit',
      icon: 'fa-brands fa-reddit',
      category: 'COMMUNITY'
    };
  }

  // Fallback for any other website (WEB)
  return {
    platform: 'Website',
    icon: 'fa-solid fa-globe',
    category: 'WEB'
  };
}
