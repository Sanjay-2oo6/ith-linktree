/**
 * JWT Token Service
 * Manages JWT token creation and verification
 */

import { createClient } from '@supabase/supabase-js';

const TOKEN_EXPIRY_HOURS = 24;

/**
 * Create a JWT token for admin session
 * @param {string} adminId - Admin user ID
 * @param {string} email - Admin email
 * @returns {string} JWT token
 */
export function createToken(adminId, email) {
  if (!adminId || !email) {
    throw new Error('adminId and email required');
  }

  // Create a simple JWT-like token structure
  // In production, use a proper JWT library
  const payload = {
    adminId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRY_HOURS * 3600)
  };

  // Base64 encode the payload
  const tokenData = btoa(JSON.stringify(payload));
  
  // Create a simple signature (in production, use proper HMAC)
  const signature = btoa(`${adminId}:${Date.now()}`);
  
  return `${tokenData}.${signature}`;
}

/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @returns {object|null} Decoded token if valid, null if invalid
 */
export function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const payload = JSON.parse(atob(parts[0]));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Get token from session storage
 * @returns {string|null} Token or null
 */
export function getToken() {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem('admin_token');
  } catch (error) {
    return null;
  }
}

/**
 * Store token in session storage
 * @param {string} token - Token to store
 */
export function setToken(token) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('admin_token', token);
    }
  } catch (error) {
    console.error('Token storage error:', error);
  }
}

/**
 * Clear token from session storage
 */
export function clearToken() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('admin_token');
    }
  } catch (error) {
    console.error('Token clear error:', error);
  }
}

/**
 * Check if current token is valid
 * @returns {boolean} True if valid token exists
 */
export function isTokenValid() {
  const token = getToken();
  return verifyToken(token) !== null;
}
