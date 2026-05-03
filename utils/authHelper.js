// utils/authHelper.js
const fs = require('fs');
const path = require('path');

/**
 * AUTH HELPER
 *
 * Handles storageState-based auth for Playwright.
 * Login once → save cookies/localStorage → reuse in all tests.
 *
 * This is the #1 CI speed optimization for authenticated test suites.
 * A 50-test suite with individual logins: ~5 min
 * With storageState reuse: ~45 seconds
 */

const authHelper = {
  statePath: path.join(__dirname, '../fixtures/auth-state.json'),

  /**
   * Performs a full login and saves the browser state to disk.
   * Call this in globalSetup, not in each test.
   *
   * @param {import('@playwright/test').Browser} browser
   * @param {{ email: string, password: string }} credentials
   */
  async saveAuthState(browser, credentials) {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(process.env.BASE_URL + '/login');
    await page.fill('#username', credentials.email);
    await page.fill('#password', credentials.password);
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('**/dashboard');

    // Save full context state: cookies, localStorage, sessionStorage
    await context.storageState({ path: this.statePath });
    console.log('✅ Auth state saved to:', this.statePath);

    await context.close();
  },

  /**
   * Check if a saved auth state exists and is recent enough.
   * @param {number} maxAgeMinutes
   */
  isAuthStateFresh(maxAgeMinutes = 60) {
    if (!fs.existsSync(this.statePath)) return false;
    const stat = fs.statSync(this.statePath);
    const ageMs = Date.now() - stat.mtimeMs;
    return ageMs < maxAgeMinutes * 60 * 1000;
  },

  /**
   * Create a mock auth state file for testing without a real server.
   */
  createMockAuthState() {
    const mockState = {
      cookies: [
        {
          name: 'auth_token',
          value: 'mock-jwt-token-for-testing',
          domain: 'localhost',
          path: '/',
          expires: Date.now() / 1000 + 3600,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
      ],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [
            { name: 'user_id', value: '42' },
            { name: 'user_role', value: 'admin' },
            { name: 'session_exp', value: String(Date.now() + 3600000) },
          ],
        },
      ],
    };

    fs.mkdirSync(path.dirname(this.statePath), { recursive: true });
    fs.writeFileSync(this.statePath, JSON.stringify(mockState, null, 2));
    console.log('✅ Mock auth state created');
    return mockState;
  },
};

module.exports = { authHelper };
