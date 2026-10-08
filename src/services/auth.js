/**
 * Authentication Service
 * Handles login, logout, and authentication verification
 */

import { createClient } from '@supabase/supabase-js';
import { verifyPassword } from './passwordHash.js';
import { createToken, setToken, clearToken, verifyToken, getToken } from './jwtService.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

/**
 * Login with email and password
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function login(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password required' };
    }

    const client = getSupabase();

    // Query admin_users table
    const { data: adminUser, error: queryError } = await client
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (queryError || !adminUser) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, adminUser.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Create token
    const token = createToken(adminUser.id, adminUser.email);

    // Store token
    setToken(token);

    // Update last_login
    await client
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    return { success: true, token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Logout current admin
 */
export function logout() {
  clearToken();
  return { success: true };
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  const token = getToken();
  return verifyToken(token) !== null;
}

/**
 * Get current admin info from token
 * @returns {object|null} Admin info or null
 */
export function getCurrentAdmin() {
  const token = getToken();
  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }

  return {
    adminId: payload.adminId,
    email: payload.email,
    expiresAt: new Date(payload.exp * 1000)
  };
}

/**
 * Log admin action to audit trail
 * @param {string} action - Action type (CREATE, UPDATE, DELETE)
 * @param {object} details - Action details
 */
export async function logAuditEvent(action, details) {
  try {
    const admin = getCurrentAdmin();
    if (!admin) return;

    const client = getSupabase();

    await client
      .from('audit_logs')
      .insert({
        admin_id: admin.adminId,
        action,
        link_id: details.linkId || null,
        changes: details.changes || null,
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
