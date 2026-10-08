/**
 * Login Page UI Component
 * Renders admin login form
 */

import { login } from '../services/auth.js';

export function createLoginPage() {
  return `
    <div class="login-page-wrapper">
      <div class="login-container">
        <div class="login-card brutal-card">
          <div class="login-header">
            <h1 class="login-title">
              <i class="fa-solid fa-lock"></i> ADMIN LOGIN
            </h1>
            <p class="login-subtitle">ITH Linktree Control Center</p>
          </div>

          <form id="login-form" class="login-form">
            <div class="form-group">
              <label class="form-label" for="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                class="brutal-input"
                placeholder="admin@example.com"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                class="brutal-input"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
            </div>

            <div id="login-error" class="login-error" style="display: none;"></div>

            <button type="submit" class="brutal-btn login-submit" style="width: 100%;">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> LOGIN
            </button>
          </form>

          <div class="login-footer">
            <p style="font-size: 0.75rem; color: var(--muted-gray); text-align: center;">
              <i class="fa-solid fa-shield-halved"></i> Secure authentication required
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachLoginHandlers(onLoginSuccess) {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter email and password');
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> LOGGING IN...';

    try {
      const result = await login(email, password);

      if (result.success) {
        showError(''); // Clear error
        console.log('✅ Login successful');
        
        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(result.token);
        }

        // Reload or navigate
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      } else {
        showError(result.error || 'Login failed');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> LOGIN';
        passwordInput.value = '';
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An error occurred. Please try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> LOGIN';
    }
  });

  function showError(message) {
    if (message) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    } else {
      errorDiv.style.display = 'none';
    }
  }
}

export function removeLoginPage() {
  const wrapper = document.querySelector('.login-page-wrapper');
  if (wrapper) {
    wrapper.remove();
  }
}
