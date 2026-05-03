// pages/LoginPage.js
const { BasePage } = require('./BasePage');

/**
 * LOGIN PAGE OBJECT
 *
 * Encapsulates all login-related DOM interactions.
 * Tests never touch raw selectors — they call methods like login(), expectError().
 *
 * Real-world example: This exact pattern is used in enterprise QA for
 * Salesforce, Jira, Workday — any auth-gated application.
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // ─── Selectors (centralised — change in one place) ──────────────────────
    this.selectors = {
  usernameInput:  '#username',
  passwordInput:  '#password',
  loginButton:    'button[type="submit"]',
  errorMessage:   '#flash',
    };
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async navigate() {
    await super.navigate('/login');
  }

  /**
   * Full login flow — handles MFA if token is provided.
   * @param {string} username
   * @param {string} password
   * @param {{ mfaToken?: string, rememberMe?: boolean }} options
   */
  async login(username, password, { mfaToken, rememberMe = false } = {}) {
    await this.safeFill(this.selectors.usernameInput, username);
    await this.safeFill(this.selectors.passwordInput, password);

    if (rememberMe) {
      await this.safeClick(this.selectors.rememberMe);
    }

    await this.safeClick(this.selectors.loginButton);

    if (mfaToken) {
      await this.page.waitForSelector(this.selectors.mfaInput);
      await this.safeFill(this.selectors.mfaInput, mfaToken);
      await this.safeClick(this.selectors.loginButton);
    }
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async expectErrorMessage(expectedText) {
    const el = this.page.locator(this.selectors.errorMessage);
    await el.waitFor({ state: 'visible' });
    return await el.innerText();
  }

  async isLoginPageVisible() {
    return await this.isVisible(this.selectors.usernameInput);
  }

  async expectRedirectAfterLogin(expectedPath) {
    await this.page.waitForURL(`**${expectedPath}`, { timeout: 10_000 });
  }
}

module.exports = { LoginPage };
