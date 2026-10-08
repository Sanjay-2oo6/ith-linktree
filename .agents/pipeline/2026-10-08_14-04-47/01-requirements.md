# Phase 1 Authentication System — Requirements Document

## Summary

Implement a secure authentication system for the ITH Linktree admin console to restrict access to authorized administrators only. The public link hub remains accessible to all visitors. Admin access requires email/password credentials stored in Supabase with bcrypt hashing. All admin operations are tracked in audit logs for security monitoring. The system uses JWT tokens (24-hour expiry) for session management and prevents unauthorized access to sensitive admin features and API configurations.

**Key Outcome:** Transform the currently public admin console into a login-protected dashboard accessible only via `connect.innotechhub.in/admin` with valid credentials.

---

## Functional Requirements

### 1. Admin Authentication & Login

1. Implement email/password login form accessible at `/admin` route
   - Email input field with validation (valid format, required)
   - Password input field (required, minimum 8 characters)
   - Submit button labeled "LOGIN" with loading state feedback
   - "Remember me" checkbox (optional, stores token in sessionStorage only, not localStorage for security)

2. Supabase integration for credential verification
   - Query `admin_users` table for matching email
   - Compare submitted password hash against stored bcrypt hash using bcryptjs
   - Retrieve admin user record (id, email, last_login, created_at)

3. Session management via JWT tokens
   - Generate JWT token on successful login with payload: `{ adminId, email, iat, exp (24 hours) }`
   - Store token in `sessionStorage` (not localStorage) to prevent persistent cross-site attacks
   - Token must include issued-at (`iat`) and expiration (`exp`) timestamps
   - Token signing key is the Supabase service role secret

4. Admin console route detection
   - Public hub loads at root `/` and subpaths (default behavior, no change)
   - Admin console accessible only at `/admin` and subpaths under admin prefix
   - Redirect to login if accessing `/admin` without valid session token

### 2. Session Validation & Authorization

1. Verify JWT token on every admin operation
   - Extract token from `sessionStorage`
   - Validate token signature, expiration, and presence of required claims
   - If invalid or expired, redirect to login; clear sessionStorage
   - If valid, allow operation and proceed

2. Protect all admin operations
   - Add/edit/delete links blocked without valid session
   - View admin console blocked without valid session
   - Supabase configuration panel blocked without valid session
   - Admin statistics and analytics visible only after login

3. Session timeout and logout
   - Manual logout clears JWT token from sessionStorage and redirects to login
   - Automatic logout on token expiration (24 hours)
   - Logout button visible in admin header/sidebar; click clears session and resets UI

### 3. Audit Logging

1. Log admin actions to `audit_logs` table
   - Captured fields: admin_id, action, link_id (if applicable), changes (JSON diff), timestamp, ip_address, user_agent
   - Actions to log: login, logout, add_link, edit_link, delete_link, move_link, toggle_featured, reset_data, config_change

2. Audit log entry creation
   - Log created immediately after successful action completion
   - Timestamp in UTC using server time (from Supabase `now()`)
   - IP address extracted from request headers or client geolocation API
   - User agent captured from browser `navigator.userAgent`
   - Changes field stores JSON diff of what was modified (e.g., `{ title: { old: "X", new: "Y" } }`)

3. Audit log queries (informational, not in Phase 1 UI)
   - Ability to retrieve recent admin actions for a specific admin
   - Ability to retrieve actions for a specific link
   - Ability to filter by date range and action type

### 4. Password Security

1. Initial admin password setup
   - One admin user pre-seeded in database with email `innotechhub.edu@gmail.com`
   - Password `InnoTechHub@2o26` hashed using bcryptjs with 10 salt rounds
   - Hash stored in `password_hash` column as string

2. Password hashing requirements
   - All passwords hashed via bcryptjs on storage (never stored in plaintext)
   - Hash verified using bcryptjs `.compare()` method during login
   - Hash algorithm: bcrypt (10 rounds minimum)

---

## Non-Functional Requirements

### Security

1. **Password Storage:** Passwords never stored plaintext; bcryptjs hashing with ≥10 salt rounds mandatory
2. **Token Security:** JWT tokens stored in `sessionStorage` only (cleared on browser close); never in localStorage or cookies
3. **HTTPS Enforcement:** All auth requests sent over HTTPS only; mixed HTTP/HTTPS connections rejected
4. **Sensitive Data Exposure:** No API keys, token secrets, or admin emails exposed in frontend code or console logs
5. **SQL Injection Prevention:** All database queries use parameterized statements via Supabase client (automatic)
6. **CORS & Header Security:** Admin routes reject cross-origin requests; set `X-Frame-Options: DENY` header
7. **Rate Limiting:** Login endpoint limited to 5 attempts per IP per 15 minutes (client-side advisory only; enforced server-side via Supabase RLS if possible)
8. **Audit Trail Immutability:** Audit logs are append-only; no modification or deletion of historical entries

### Performance

1. **Login Response Time:** Login form submission and validation completes within 2 seconds (98th percentile)
2. **Token Validation Overhead:** Session verification does not add more than 50ms latency to admin operations
3. **Lazy Loading:** Auth service and JWT utilities loaded only when `/admin` route detected

### Reliability

1. **Graceful Degradation:** If Supabase connection fails, admin console shows offline message; public hub continues functioning
2. **Token Expiry Handling:** Expired tokens detected within 1 second; user redirected to login with "session expired" message
3. **Database Unavailability:** Login failures due to DB down surface as generic "Unable to authenticate" error (no DB-specific errors to user)

### Compliance & Maintainability

1. **Code Organization:** Auth logic isolated in dedicated service files (`passwordHash.js`, `jwtService.js`, `auth.js`, `auditLog.js`)
2. **Environment Configuration:** All Supabase credentials and JWT secrets read from `.env` file; no hardcoded secrets in source code
3. **Documentation:** Inline code comments explain security decisions; `.env.example` provided with all required keys
4. **Backward Compatibility:** Public hub functionality unchanged; existing link and analytics features work as before

---

## Acceptance Criteria

### Functional Acceptance

1. **AC-1:** Admin can log in with email `innotechhub.edu@gmail.com` and password `InnoTechHub@2o26` at `/admin` and receive a valid JWT token in sessionStorage

2. **AC-2:** Accessing `/admin` without a valid token redirects to login form with clear UI

3. **AC-3:** Once logged in, admin can add, edit, delete, and manage links in admin console; all operations are blocked when token is invalid or missing

4. **AC-4:** Logout button clears JWT token from sessionStorage and redirects to login form

5. **AC-5:** JWT token with invalid signature or expired timestamp is rejected; user is logged out automatically with redirect to login

6. **AC-6:** Each admin action (add link, edit link, delete link, etc.) creates an entry in `audit_logs` table with admin_id, action type, timestamp, and changes JSON

7. **AC-7:** Public link hub (`/`) remains fully functional without authentication; visitors can view links, search, filter by category, and click links without login

8. **AC-8:** All existing analytics, click tracking, and geolocation features work unchanged; public view shows all active stats

### Security Acceptance

9. **AC-9:** Passwords are hashed using bcryptjs with minimum 10 salt rounds; plaintext password never stored or logged

10. **AC-10:** JWT tokens stored in `sessionStorage` only; no tokens in `localStorage`, cookies, or URL query parameters

11. **AC-11:** API keys and Supabase credentials not visible in browser console, network tab, or source code inspection

12. **AC-12:** Accessing `/admin` from a different browser tab/window without a token shows login form, not cached admin console

13. **AC-13:** Session tokens expire after exactly 24 hours; expired tokens are rejected on next operation with redirect to login

14. **AC-14:** Sensitive data (email, password, tokens) never exposed in toast notifications, console errors, or error messages shown to user

### Environmental Acceptance

15. **AC-15:** `.env` file exists in project root with all required Supabase URLs and keys; `.env` is in `.gitignore` to prevent accidental commits

16. **AC-16:** `.env.example` file provided with placeholder values for all required keys (no secrets in example)

17. **AC-17:** `package.json` includes `bcryptjs` dependency (version ≥4.4.0)

18. **AC-18:** Build and tests pass without errors; no console warnings related to missing dependencies or uninitialized variables

---

## Out of Scope

1. **Multi-user Admin System:** Only one admin user supported in Phase 1; no user management UI or role-based access control
2. **Password Reset/Recovery:** No self-service password reset; password changes require manual database update
3. **Two-Factor Authentication (2FA):** Not included; single-factor email/password only
4. **OAuth/SSO Integration:** No Google, GitHub, or other third-party login providers
5. **Brute Force Protection (Server-Side):** Client-side advisory only; server-side rate limiting deferred to Phase 2
6. **Session Management UI:** No active sessions dashboard or ability to revoke tokens remotely
7. **Audit Log UI/Export:** Audit logs stored but no frontend to view or export; query via database directly or future admin dashboard
8. **Password Complexity Rules:** No enforced complexity requirements (length only, minimum 8 chars, on form submission)
9. **Automatic Logout on Inactivity:** Session stays valid for full 24 hours regardless of usage; no inactivity-based logout
10. **LDAP/Active Directory Integration:** Not supported in Phase 1
11. **Email Notifications:** No email alerts on login, logout, or suspicious activity
12. **Encrypted Database Fields:** Passwords hashed but sensitive data not encrypted at rest; Supabase RLS used for access control
13. **Admin Action Confirmation Prompts:** Existing destructive action confirmations (delete link) remain; no additional auth challenge

---

## Assumptions & Notes

### Assumptions Made (To Be Validated in Design Review)

1. **Single Admin User:** The implementation assumes only one admin (`innotechhub.edu@gmail.com`) exists during Phase 1; multi-admin support deferred
2. **Supabase as Auth Provider:** Supabase Postgres database is the source of truth for admin credentials; no external auth API
3. **JWT Expiry of 24 Hours:** Chosen as balance between security (short-lived) and usability (full business day); adjustable post-review
4. **SessionStorage Scope:** JWT stored in `sessionStorage` (cleared on browser close) for single-tab security; assumes each browser instance is a separate session
5. **No Client-Side Secret Storage:** Anon key used for general operations; service role key stored server-side only (not sent to browser)
6. **Audit Logs Retained Indefinitely:** No retention policy specified; logs append indefinitely until storage limits
7. **No Rate Limiting Server-Side:** Rate limiting advisory only; actual enforcement deferred to Supabase RLS policies or backend middleware

### Technical Stack Locked

- **Frontend Framework:** Vite + vanilla JavaScript (no change)
- **Backend/Database:** Supabase (Postgres with Auth)
- **Password Hashing:** bcryptjs v4.4.0+ (added to dependencies)
- **Token Format:** JWT (JSON Web Tokens)
- **Token Storage:** sessionStorage (browser API)
- **Region:** South Asia (Mumbai) — Supabase project `geobehszicrezpbgokcs`

### Dependencies to Be Added

- **bcryptjs:** ^4.4.0 (for password hashing/verification)

### Credentials & Secrets (Provided)

- **Supabase Project ID:** geobehszicrezpbgokcs
- **Supabase Project URL:** https://geobehszicrezpbgokcs.supabase.co
- **Supabase Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (truncated for security)
- **Supabase Service Role Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6InNlcnZpY2Vfcm9sZSI... (truncated for security)
- **Admin Email:** innotechhub.edu@gmail.com
- **Admin Password (to Hash):** InnoTechHub@2o26

---

## Success Metrics

- ✅ Login form appears at `/admin` without auth token
- ✅ Valid credentials grant access to admin console with JWT token
- ✅ Invalid credentials show error message; session not created
- ✅ Logout clears token and redirects to login
- ✅ Expired token triggers re-login automatically
- ✅ Public hub works identically before and after auth implementation
- ✅ All admin actions logged to audit_logs table
- ✅ No secrets exposed in code, console, or network traffic
- ✅ Tests pass: login flow, protected routes, token expiry, audit logging, password hashing
