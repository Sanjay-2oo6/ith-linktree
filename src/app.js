/**
 * Neo-Brutalist Link Hub & Admin Console — Main Application Logic
 */

import { detectPlatformFromUrl } from './detector.js';
import {
  getProfile,
  getLinks,
  addLink,
  updateLink,
  deleteLink,
  moveLink,
  toggleFeatured,
  incrementClicks,
  resetToDefault
} from './storage.js';
import { fetchLinkPreview } from './services/linkPreview.js';
import { getVisitorLocation, recordClickEvent, getGeoStats } from './services/geoAnalytics.js';
import { getSupabaseUrl, setSupabaseUrl } from './config.js';
import { isSupabaseConnected, syncLinkToRemote, deleteRemoteLink, fetchRemoteLinks } from './services/supabaseClient.js';

// Application State
const state = {
  profile: getProfile(),
  links: getLinks(),
  searchQuery: '',
  selectedCategory: 'ALL',
  editingLinkId: null,
  viewMode: 'split' // 'split' | 'public' | 'admin'
};

export const elements = {};

export function initElements() {
  elements.appWrapper = document.getElementById('app-wrapper');
  elements.tickerActiveLinks = document.getElementById('stat-active-links');
  elements.tickerTotalClicks = document.getElementById('stat-total-clicks');
  elements.tickerPlatforms = document.getElementById('stat-platforms');
  elements.statVisitorGeo = document.getElementById('stat-visitor-geo');
  elements.viewModeSplit = document.getElementById('view-mode-split');
  elements.viewModePublic = document.getElementById('view-mode-public');
  elements.viewModeAdmin = document.getElementById('view-mode-admin');
  elements.btnResetData = document.getElementById('btn-reset-data');

  // Hero Section
  elements.heroTitle = document.getElementById('hero-title');
  elements.heroHandle = document.getElementById('hero-handle');
  elements.heroBio = document.getElementById('hero-bio');

  // Admin Elements
  elements.adminForm = document.getElementById('admin-link-form');
  elements.formLegend = document.getElementById('form-legend');
  elements.editLinkId = document.getElementById('edit-link-id');
  elements.inputTitle = document.getElementById('input-link-title');
  elements.inputUrl = document.getElementById('input-link-url');
  elements.inputFeatured = document.getElementById('input-link-featured');
  elements.btnSubmitLink = document.getElementById('btn-submit-link');
  elements.btnSubmitText = document.getElementById('btn-submit-text');
  elements.btnCancelEdit = document.getElementById('btn-cancel-edit');
  elements.btnFetchMetadata = document.getElementById('btn-fetch-metadata');
  elements.metadataPreviewBox = document.getElementById('metadata-preview-box');
  elements.metadataPreviewImg = document.getElementById('metadata-preview-img');
  elements.metadataPreviewTitle = document.getElementById('metadata-preview-title');
  elements.metadataPreviewDesc = document.getElementById('metadata-preview-desc');
  elements.detectedIconPreview = document.getElementById('detected-icon-preview');
  elements.detectedPlatformName = document.getElementById('detected-platform-name');
  elements.detectedCategoryName = document.getElementById('detected-category-name');
  elements.adminLinksCount = document.getElementById('admin-links-count');
  elements.adminTabLinksCount = document.getElementById('admin-tab-links-count');
  elements.adminItemsWrapper = document.getElementById('admin-items-wrapper');

  // Geo Analytics & Supabase Admin Elements
  elements.geoTotalClicks = document.getElementById('geo-total-clicks');
  elements.geoCountriesList = document.getElementById('geo-countries-list');
  elements.geoRecentFeed = document.getElementById('geo-recent-feed');
  elements.supabaseStatusBadge = document.getElementById('supabase-status-badge');
  elements.inputSupabaseUrl = document.getElementById('input-supabase-url');
  elements.btnSaveSupabase = document.getElementById('btn-save-supabase');

  // Public Hub Elements
  elements.searchInput = document.getElementById('search-input');
  elements.categoryTabs = document.getElementById('category-tabs');
  elements.linksGrid = document.getElementById('links-grid');
  elements.noResultsBox = document.getElementById('no-results-box');
  elements.btnClearSearch = document.getElementById('btn-clear-search');
  elements.toastContainer = document.getElementById('toast-container');

  // Confirmation Modal Elements
  elements.modalBackdrop = document.getElementById('brutal-modal-backdrop');
  elements.modalTitle = document.getElementById('modal-title');
  elements.modalMessage = document.getElementById('modal-message');
  elements.modalConfirmBtn = document.getElementById('modal-confirm-btn');
  elements.modalCancelBtn = document.getElementById('modal-cancel-btn');
  elements.modalCloseBtn = document.getElementById('modal-close-btn');
}

let pendingConfirmCallback = null;

export function showConfirmModal({ title, message, confirmText = 'CONFIRM', confirmColor = 'danger', onConfirm }) {
  if (!elements.modalBackdrop) {
    if (confirm(message)) onConfirm();
    return;
  }
  elements.modalTitle.textContent = title;
  elements.modalMessage.textContent = message;
  elements.modalConfirmBtn.textContent = confirmText;
  elements.modalConfirmBtn.className = `brutal-btn ${confirmColor === 'danger' ? 'brutal-btn-danger' : 'brutal-btn'}`;
  pendingConfirmCallback = onConfirm;
  elements.modalBackdrop.style.display = 'flex';
  elements.modalConfirmBtn.focus();
}

export function hideConfirmModal() {
  if (elements.modalBackdrop) {
    elements.modalBackdrop.style.display = 'none';
  }
  pendingConfirmCallback = null;
}

/**
 * Toast Notification System
 */
export function showToast(message, type = 'success', duration = 2800) {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `brutal-toast toast-${type}`;
  
  let iconHtml = '<i class="fa-solid fa-check"></i>';
  if (type === 'toast-error' || type === 'error') {
    toast.className = 'brutal-toast toast-error';
    iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
  } else if (type === 'toast-info' || type === 'info') {
    toast.className = 'brutal-toast toast-info';
    iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  }

  toast.innerHTML = `${iconHtml} <span>${message}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

/**
 * Update Top Ticker Bar Statistics
 */
function updateTickerStats() {
  const activeLinks = state.links.filter(l => l.active !== false);
  const totalClicks = state.links.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
  const uniquePlatforms = new Set(state.links.map(l => l.platform)).size;

  if (elements.tickerActiveLinks) {
    elements.tickerActiveLinks.textContent = activeLinks.length;
  }
  if (elements.tickerTotalClicks) {
    elements.tickerTotalClicks.textContent = totalClicks.toLocaleString();
  }
  if (elements.tickerPlatforms) {
    elements.tickerPlatforms.textContent = uniquePlatforms;
  }
  if (elements.adminLinksCount) {
    elements.adminLinksCount.textContent = state.links.length;
  }
  if (elements.adminTabLinksCount) {
    elements.adminTabLinksCount.textContent = state.links.length;
  }
}

/**
 * Handle URL Input Live Detection
 */
function handleUrlLiveDetection(url) {
  const detection = detectPlatformFromUrl(url);

  if (elements.detectedIconPreview) {
    elements.detectedIconPreview.className = detection.icon;
  }
  if (elements.detectedPlatformName) {
    elements.detectedPlatformName.textContent = detection.platform;
  }
  if (elements.detectedCategoryName) {
    elements.detectedCategoryName.textContent = detection.category;
  }

  return detection;
}

/**
 * Render Admin Console Links Management List
 */
function renderAdminLinksList() {
  if (!elements.adminItemsWrapper) return;
  elements.adminItemsWrapper.innerHTML = '';

  if (state.links.length === 0) {
    elements.adminItemsWrapper.innerHTML = `
      <div style="padding: 1rem; text-align: center; color: var(--muted-gray); font-size: 0.8rem; border: 2px dashed #D1D5DB;">
        No links created yet. Use the form above to add your first link!
      </div>
    `;
    return;
  }

  state.links.forEach((link, index) => {
    const row = document.createElement('div');
    row.className = `admin-link-row ${link.featured ? 'is-featured' : ''}`;
    row.dataset.id = link.id;

    const isFirst = index === 0;
    const isLast = index === state.links.length - 1;

    row.innerHTML = `
      <div class="admin-link-info">
        <span class="admin-order-badge">#${index + 1}</span>
        <div style="font-size: 1rem; width: 22px; text-align: center; color: var(--dark-black);">
          <i class="${link.icon}"></i>
        </div>
        <div class="admin-link-details">
          <span class="admin-link-title-text" title="${link.title}">${link.title}</span>
          <span class="admin-link-meta-text">${link.platform} • ${link.clicks || 0} clicks</span>
        </div>
      </div>
      <div class="admin-link-actions">
        <button type="button" class="admin-icon-btn btn-up" data-action="up" data-id="${link.id}" title="Move Up" ${isFirst ? 'disabled' : ''}>
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        <button type="button" class="admin-icon-btn btn-down" data-action="down" data-id="${link.id}" title="Move Down" ${isLast ? 'disabled' : ''}>
          <i class="fa-solid fa-arrow-down"></i>
        </button>
        <button type="button" class="admin-icon-btn btn-star ${link.featured ? 'active' : ''}" data-action="star" data-id="${link.id}" title="${link.featured ? 'Remove Highlight' : 'Highlight Link'}">
          <i class="fa-solid fa-star"></i>
        </button>
        <button type="button" class="admin-icon-btn btn-edit" data-action="edit" data-id="${link.id}" title="Edit Link">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button type="button" class="admin-icon-btn btn-del" data-action="delete" data-id="${link.id}" title="Delete Link">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    elements.adminItemsWrapper.appendChild(row);
  });
}

/**
 * Filter Links based on Search and Selected Category
 */
function getFilteredLinks() {
  const query = state.searchQuery.trim().toLowerCase();
  const selectedCat = state.selectedCategory.toUpperCase();

  return state.links.filter(link => {
    if (link.active === false) return false;

    // Category Filter
    if (selectedCat !== 'ALL') {
      const linkCat = (link.category || 'WEB').toUpperCase();
      // Handle SOCIAL vs SOCIALS match
      if (selectedCat === 'SOCIALS' && linkCat !== 'SOCIAL') {
        return false;
      } else if (selectedCat !== 'SOCIALS' && linkCat !== selectedCat) {
        return false;
      }
    }

    // Search Query Filter
    if (query) {
      const matchTitle = (link.title || '').toLowerCase().includes(query);
      const matchUrl = (link.url || '').toLowerCase().includes(query);
      const matchPlatform = (link.platform || '').toLowerCase().includes(query);
      const matchCat = (link.category || '').toLowerCase().includes(query);
      return matchTitle || matchUrl || matchPlatform || matchCat;
    }

    return true;
  });
}

/**
 * Render Public Hub Link Cards Grid
 */
function renderPublicLinksGrid() {
  if (!elements.linksGrid || !elements.noResultsBox) return;

  const filtered = getFilteredLinks();

  if (filtered.length === 0) {
    elements.linksGrid.style.display = 'none';
    elements.noResultsBox.style.display = 'flex';
    return;
  }

  elements.linksGrid.style.display = 'grid';
  elements.noResultsBox.style.display = 'none';
  elements.linksGrid.innerHTML = '';

  filtered.forEach(link => {
    const card = document.createElement('a');
    card.className = `link-card brutal-card ${link.featured ? 'is-featured' : ''}`;
    card.href = link.url;
    card.dataset.id = link.id;
    card.setAttribute('rel', 'noopener noreferrer');
    if (!link.url.toLowerCase().startsWith('mailto:')) {
      card.setAttribute('target', '_blank');
    }

    // Featured Header Banner if highlighted
    const featuredBannerHtml = link.featured
      ? `<div class="link-card-featured-header">
           <span><i class="fa-solid fa-star"></i> FEATURED SPOTLIGHT</span>
           <span>OFFICIAL</span>
         </div>`
      : '';

    card.innerHTML = `
      ${featuredBannerHtml}
      <div class="link-card-body">
        <div class="link-card-top">
          <div class="link-icon-box">
            <i class="${link.icon}"></i>
          </div>
          <div class="link-pills-row">
            <span class="platform-pill">${link.platform}</span>
            <span class="clicks-pill" id="card-clicks-${link.id}">
              <i class="fa-solid fa-arrow-pointer"></i> ${(link.clicks || 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div class="link-card-content">
          <h3 class="link-card-title">${link.title}</h3>
          <span class="link-card-url">
            <i class="fa-solid fa-link" style="font-size: 0.75rem;"></i>
            ${link.url}
          </span>
        </div>
      </div>
      <div class="link-card-footer">
        <span class="brutal-badge" style="font-size: 0.7rem; background-color: #E5E7EB;">
          ${link.category || 'WEB'}
        </span>
        <span class="link-card-action-text">
          VISIT <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </span>
      </div>
    `;

    // Intercept click to track clicks counter & geographic analytics
    card.addEventListener('click', (e) => {
      // Increment clicks
      const updatedClicks = incrementClicks(link.id);
      link.clicks = updatedClicks;

      // Update card click pill immediately
      const pill = card.querySelector(`#card-clicks-${link.id}`);
      if (pill) {
        pill.innerHTML = `<i class="fa-solid fa-arrow-pointer"></i> ${updatedClicks.toLocaleString()}`;
      }

      // Update ticker
      updateTickerStats();

      // Record Geographic Click Event via IPGeolocation
      recordClickEvent(link).then(() => {
        renderGeoAnalytics();
      });

      // Sync to Supabase if connected
      if (isSupabaseConnected()) {
        syncLinkToRemote(link);
      }

      // Update admin list clicks text if present
      renderAdminLinksList();
    });

    elements.linksGrid.appendChild(card);
  });
}

/**
 * Render IPGeolocation Analytics Section
 */
export function renderGeoAnalytics() {
  const stats = getGeoStats();
  if (elements.geoTotalClicks) {
    elements.geoTotalClicks.textContent = stats.totalTracked;
  }

  if (elements.geoCountriesList) {
    if (stats.countries.length === 0) {
      elements.geoCountriesList.innerHTML = '<span style="font-size: 0.75rem; color: var(--muted-gray);">No click geography recorded yet.</span>';
    } else {
      elements.geoCountriesList.innerHTML = stats.countries.map(c => `
        <span class="geo-country-pill">
          <span>${c.country}</span>
          <span class="geo-country-count">${c.count}</span>
        </span>
      `).join('');
    }
  }

  if (elements.geoRecentFeed) {
    if (stats.recentEvents.length === 0) {
      elements.geoRecentFeed.innerHTML = '';
    } else {
      elements.geoRecentFeed.innerHTML = stats.recentEvents.map(ev => {
        const timeStr = new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
          <div class="geo-feed-item">
            <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${ev.linkTitle}</span>
            <span style="color:var(--muted-gray); font-size:0.65rem;">📍 ${ev.city}, ${ev.country} • ${timeStr}</span>
          </div>
        `;
      }).join('');
    }
  }
}

/**
 * Handle LinkPreview API Auto-Fetch
 */
async function handleAutoFetchMetadata() {
  const url = elements.inputUrl.value.trim();
  if (!url) {
    showToast('Please enter a URL first to fetch metadata', 'error');
    elements.inputUrl.focus();
    return;
  }

  if (!elements.btnFetchMetadata) return;

  const originalBtnHtml = elements.btnFetchMetadata.innerHTML;
  elements.btnFetchMetadata.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> FETCHING...';
  elements.btnFetchMetadata.disabled = true;

  try {
    const preview = await fetchLinkPreview(url);
    if (preview && preview.title) {
      // Auto-populate Title if empty
      if (!elements.inputTitle.value.trim()) {
        elements.inputTitle.value = preview.title;
      }

      // Display preview box
      if (elements.metadataPreviewBox) {
        elements.metadataPreviewBox.style.display = 'flex';
        elements.metadataPreviewTitle.textContent = preview.title;
        elements.metadataPreviewDesc.textContent = preview.description || 'Page metadata loaded';
        if (preview.image) {
          elements.metadataPreviewImg.src = preview.image;
          elements.metadataPreviewImg.style.display = 'block';
        } else {
          elements.metadataPreviewImg.style.display = 'none';
        }
      }
      showToast(`Auto-fetched: "${preview.title.substring(0, 28)}..."`);
    } else {
      showToast('Could not fetch preview. Check URL.', 'info');
    }
  } catch (err) {
    showToast('Preview fetch error', 'error');
  } finally {
    elements.btnFetchMetadata.innerHTML = originalBtnHtml;
    elements.btnFetchMetadata.disabled = false;
  }
}

/**
 * Update Supabase Connection UI
 */
export function updateSupabaseStatusUI() {
  const url = getSupabaseUrl();
  if (elements.inputSupabaseUrl) elements.inputSupabaseUrl.value = url;
  if (elements.supabaseStatusBadge) {
    if (url) {
      elements.supabaseStatusBadge.textContent = 'CONNECTED';
      elements.supabaseStatusBadge.style.backgroundColor = '#10B981';
      elements.supabaseStatusBadge.style.color = '#FFFFFF';
    } else {
      elements.supabaseStatusBadge.textContent = 'LOCAL SYNC';
      elements.supabaseStatusBadge.style.backgroundColor = '#E5E7EB';
      elements.supabaseStatusBadge.style.color = '#0D0D0D';
    }
  }
}

/**
 * Reset phone canvas viewport scroll position
 */
export function resetPhoneScroll() {
  const phoneScroll = document.querySelector('.phone-inner-scroll');
  if (phoneScroll) {
    phoneScroll.scrollTop = 0;
  }
}

/**
 * Full UI Refresh
 */
function refreshUI() {
  updateTickerStats();
  renderAdminLinksList();
  renderPublicLinksGrid();
  renderGeoAnalytics();
  updateSupabaseStatusUI();
}

/**
 * Handle Admin Form Submit (Add or Edit)
 */
function handleAdminFormSubmit(e) {
  e.preventDefault();

  const title = elements.inputTitle.value.trim();
  let url = elements.inputUrl.value.trim();
  const featured = elements.inputFeatured.checked;
  const editId = elements.editLinkId.value;

  if (!title) {
    showToast('Please enter a link title', 'error');
    elements.inputTitle.focus();
    return;
  }

  if (!url) {
    showToast('Please enter a valid link URL', 'error');
    elements.inputUrl.focus();
    return;
  }

  // Prepend https:// if not starting with protocol or mailto:
  if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
    url = `https://${url}`;
  }

  if (editId) {
    // Update existing link
    const updated = updateLink(editId, { title, url, featured });
    state.links = getLinks();
    if (isSupabaseConnected() && updated) {
      syncLinkToRemote(updated);
    }
    showToast(`Updated "${title}" successfully!`);
    resetAdminForm();
  } else {
    // Add new link
    const newLink = addLink({ title, url, featured });
    state.links = getLinks();
    if (isSupabaseConnected() && newLink) {
      syncLinkToRemote(newLink);
    }
    showToast(`Added "${newLink.title}" successfully!`);
    resetAdminForm();
  }

  refreshUI();
}

/**
 * Reset Admin Form State
 */
function resetAdminForm() {
  state.editingLinkId = null;
  elements.adminForm.reset();
  elements.editLinkId.value = '';
  elements.formLegend.innerHTML = '<i class="fa-solid fa-plus"></i> ADD NEW LINK';
  elements.btnSubmitText.textContent = 'PUBLISH LINK';
  elements.btnCancelEdit.style.display = 'none';
  elements.inputFeatured.checked = false;
  if (elements.metadataPreviewBox) {
    elements.metadataPreviewBox.style.display = 'none';
  }
  handleUrlLiveDetection('');
}

/**
 * Enter Edit Mode for a Link
 */
function startEditLink(id) {
  const link = state.links.find(l => l.id === id);
  if (!link) return;

  state.editingLinkId = id;
  elements.editLinkId.value = link.id;
  elements.inputTitle.value = link.title;
  elements.inputUrl.value = link.url;
  elements.inputFeatured.checked = Boolean(link.featured);

  elements.formLegend.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> EDIT: ${link.title}`;
  elements.btnSubmitText.textContent = 'SAVE CHANGES';
  elements.btnCancelEdit.style.display = 'inline-block';

  handleUrlLiveDetection(link.url);
  elements.inputTitle.focus();

  // Scroll to admin form on mobile or smaller screens
  if (elements.adminForm && typeof elements.adminForm.scrollIntoView === 'function') {
    elements.adminForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Handle Admin Item Actions (Reorder, Star, Edit, Delete)
 */
function handleAdminAction(action, id) {
  switch (action) {
    case 'up':
      moveLink(id, 'up');
      state.links = getLinks();
      refreshUI();
      break;

    case 'down':
      moveLink(id, 'down');
      state.links = getLinks();
      refreshUI();
      break;

    case 'star':
      toggleFeatured(id);
      state.links = getLinks();
      refreshUI();
      const updated = state.links.find(l => l.id === id);
      showToast(updated?.featured ? 'Link featured!' : 'Link highlight removed');
      break;

    case 'edit':
      startEditLink(id);
      break;

    case 'delete':
      const target = state.links.find(l => l.id === id);
      const targetTitle = target ? target.title : 'Link';
      showConfirmModal({
        title: 'DELETE LINK',
        message: `Are you sure you want to delete "${targetTitle}"? This will immediately remove it from both the Admin Console and the Public Link Hub.`,
        confirmText: 'YES, DELETE',
        confirmColor: 'danger',
        onConfirm: () => {
          deleteLink(id);
          state.links = getLinks();
          if (isSupabaseConnected()) {
            deleteRemoteLink(id);
          }
          if (state.editingLinkId === id) {
            resetAdminForm();
          }
          showToast(`Deleted "${targetTitle}"`, 'info');
          refreshUI();
        }
      });
      break;
  }
}

/**
 * Set View Mode (Split, Public Only, Admin Only)
 */
function setViewMode(mode) {
  state.viewMode = mode;
  elements.viewModeSplit.classList.toggle('active', mode === 'split');
  elements.viewModePublic.classList.toggle('active', mode === 'public');
  elements.viewModeAdmin.classList.toggle('active', mode === 'admin');

  elements.appWrapper.classList.remove('view-public-only', 'view-admin-only');
  if (mode === 'public') {
    elements.appWrapper.classList.add('view-public-only');
  } else if (mode === 'admin') {
    elements.appWrapper.classList.add('view-admin-only');
  }
  resetPhoneScroll();
}

/**
 * Initialize Event Listeners
 */
function initEventListeners() {
  // Studio Navigation Tabs Switching
  const studioTabBtns = document.querySelectorAll('.studio-tab-btn');
  studioTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      studioTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.studio-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `pane-${tabName}`);
      });
    });
  });

  // Live URL Detection on typing, keyup, change, and paste
  ['input', 'keyup', 'change'].forEach(evt => {
    elements.inputUrl.addEventListener(evt, (e) => {
      handleUrlLiveDetection(e.target.value);
    });
  });
  elements.inputUrl.addEventListener('paste', () => {
    setTimeout(() => handleUrlLiveDetection(elements.inputUrl.value), 20);
  });

  // Auto-Fetch LinkPreview Metadata Button
  if (elements.btnFetchMetadata) {
    elements.btnFetchMetadata.addEventListener('click', handleAutoFetchMetadata);
  }

  // Supabase Save & Connect Button
  if (elements.btnSaveSupabase) {
    elements.btnSaveSupabase.addEventListener('click', async () => {
      const url = elements.inputSupabaseUrl?.value?.trim() || '';
      if (!url) {
        setSupabaseUrl('');
        updateSupabaseStatusUI();
        showToast('Supabase disconnected. Using local storage.', 'info');
        return;
      }
      if (!/^https?:\/\//i.test(url) || !url.includes('supabase.co')) {
        showToast('Please enter a valid Supabase project URL (https://xyz.supabase.co)', 'error');
        return;
      }
      setSupabaseUrl(url);
      updateSupabaseStatusUI();
      showToast('Connected to Supabase! Syncing links...', 'info');

      const currentLinks = getLinks();
      for (const l of currentLinks) {
        await syncLinkToRemote(l);
      }
      showToast('All links synced to Supabase!', 'success');
    });
  }

  // Modal Listeners
  if (elements.modalCancelBtn) {
    elements.modalCancelBtn.addEventListener('click', hideConfirmModal);
  }
  if (elements.modalCloseBtn) {
    elements.modalCloseBtn.addEventListener('click', hideConfirmModal);
  }
  if (elements.modalBackdrop) {
    elements.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.modalBackdrop) hideConfirmModal();
    });
  }
  if (elements.modalConfirmBtn) {
    elements.modalConfirmBtn.addEventListener('click', () => {
      if (pendingConfirmCallback) {
        const cb = pendingConfirmCallback;
        hideConfirmModal();
        cb();
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modalBackdrop?.style.display === 'flex') {
      hideConfirmModal();
    }
  });

  // Admin Form Submit & Cancel
  elements.adminForm.addEventListener('submit', handleAdminFormSubmit);
  elements.btnCancelEdit.addEventListener('click', resetAdminForm);

  // Admin Items Action Delegation
  elements.adminItemsWrapper.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-icon-btn');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action && id) {
      handleAdminAction(action, id);
    }
  });

  // Search Input live typing
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderPublicLinksGrid();
  });

  // Clear Search & Filters Button
  elements.btnClearSearch.addEventListener('click', () => {
    state.searchQuery = '';
    state.selectedCategory = 'ALL';
    elements.searchInput.value = '';

    // Reset active category tab
    const tabs = elements.categoryTabs.querySelectorAll('.category-filter-btn');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === 'ALL');
    });

    renderPublicLinksGrid();
  });

  // Category Filter Tabs
  elements.categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-filter-btn');
    if (!btn) return;

    const category = btn.dataset.category;
    state.selectedCategory = category;

    // Update active class on tabs
    const tabs = elements.categoryTabs.querySelectorAll('.category-filter-btn');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    renderPublicLinksGrid();
  });

  // View Mode Controls
  elements.viewModeSplit.addEventListener('click', () => setViewMode('split'));
  elements.viewModePublic.addEventListener('click', () => setViewMode('public'));
  elements.viewModeAdmin.addEventListener('click', () => setViewMode('admin'));

  // Reset to Default Demo Data
  elements.btnResetData.addEventListener('click', () => {
    showConfirmModal({
      title: 'RESET ALL DATA',
      message: 'Restore all official links, categories, and profile metadata to factory defaults?',
      confirmText: 'RESET TO DEFAULTS',
      confirmColor: 'yellow',
      onConfirm: () => {
        resetToDefault();
        state.links = getLinks();
        state.profile = getProfile();
        resetAdminForm();
        refreshUI();
        showToast('Reset to official defaults!', 'info');
      }
    });
  });
}

/**
 * Application Entry Point
 */
export function init() {
  initElements();
  state.profile = getProfile();
  state.links = getLinks();

  // Populate initial hero profile text from storage
  if (state.profile) {
    if (elements.heroTitle) elements.heroTitle.textContent = state.profile.title;
    if (elements.heroHandle) elements.heroHandle.textContent = state.profile.handle;
    if (elements.heroBio) elements.heroBio.textContent = state.profile.bio;
  }

  // Initialize live detection display for empty state
  handleUrlLiveDetection('');

  // Attach all event listeners
  initEventListeners();

  // Initial render
  refreshUI();
  resetPhoneScroll();

  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  // Visitor Geo Location resolution
  getVisitorLocation().then(geo => {
    if (geo && elements.statVisitorGeo) {
      elements.statVisitorGeo.textContent = `${geo.city || ''}, ${geo.country || 'Detected'}`.trim();
    } else if (elements.statVisitorGeo) {
      elements.statVisitorGeo.textContent = 'Active';
    }
  });

  // Check remote Supabase sync if connected
  if (isSupabaseConnected()) {
    fetchRemoteLinks().then(remoteLinks => {
      if (remoteLinks && remoteLinks.length > 0) {
        state.links = remoteLinks;
        refreshUI();
      }
    });
  }
}

export { state };

// Start application when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

