/**
 * Supabase Client & Cloud Synchronization
 */

import { createClient } from '@supabase/supabase-js';
import { API_KEYS, getSupabaseUrl, setSupabaseUrl } from '../config.js';

let supabaseClient = null;

export function getSupabase() {
  const url = getSupabaseUrl();
  if (!url) return null;

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, API_KEYS.SUPABASE_PUBLISHABLE_KEY);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

export function isSupabaseConnected() {
  return Boolean(getSupabaseUrl());
}

export async function fetchRemoteLinks() {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('links')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase remote query failed:', err.message);
    return null;
  }
}

export async function syncLinkToRemote(link) {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('links')
      .upsert({
        id: link.id,
        title: link.title,
        url: link.url,
        platform: link.platform,
        icon: link.icon,
        category: link.category,
        featured: link.featured,
        clicks: link.clicks,
        order: link.order,
        active: link.active
      });

    if (error) {
      console.warn('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteRemoteLink(id) {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('links').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}
