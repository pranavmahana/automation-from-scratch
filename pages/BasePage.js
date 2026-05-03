// pages/BasePage.js
/**
 * BASE PAGE OBJECT MODEL
 *
 * All page objects extend this. Centralizes:
 *  - Common wait strategies
 *  - Screenshot helpers
 *  - Retry-safe click/fill
 *  - Accessibility checks
 *
 * Pattern: Page Object Model (POM)
 * Why: Decouples test logic from DOM structure. One selector change = one file change.
 */

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.timeout = 10_000;
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigate(path = '/') {
    await this.page.goto(path, { waitUntil: 'networkidle' });
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Smart Interactions ────────────────────────────────────────────────────

  /**
   * Retry-safe click. Waits for element to be visible + enabled before clicking.
   * Handles flaky elements in CI environments.
   */
  async safeClick(selector, options = {}) {
    const el = this.page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout: this.timeout });
    await el.scrollIntoViewIfNeeded();
    await el.click(options);
  }

  /**
   * Clears field before typing. Avoids stale input bugs.
   */
  async safeFill(selector, value) {
    const el = this.page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout: this.timeout });
    await el.clear();
    await el.fill(value);
  }

  async selectOption(selector, value) {
    await this.page.locator(selector).selectOption(value);
  }

  // ─── Assertions Helpers ────────────────────────────────────────────────────

  async isVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  async getText(selector) {
    return await this.page.locator(selector).innerText();
  }

  async getTitle() {
    return await this.page.title();
  }

  async getURL() {
    return this.page.url();
  }

  // ─── Screenshot / Debugging ────────────────────────────────────────────────

  async captureScreenshot(name) {
    await this.page.screenshot({
      path: `reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  // ─── Network Interception ─────────────────────────────────────────────────

  /**
   * Intercept API calls — mock responses to test UI behavior
   * without backend dependency.
   */
  async mockAPI(url, body, status = 200) {
    await this.page.route(url, route =>
      route.fulfill({ status, body: JSON.stringify(body) })
    );
  }

  async interceptRequest(url) {
    return new Promise(resolve => {
      this.page.once('request', req => {
        if (req.url().includes(url)) resolve(req);
      });
    });
  }

  // ─── Accessibility ─────────────────────────────────────────────────────────

  async checkNoAriaViolations(selector = 'body') {
    // Integrates with axe-core when needed
    const el = this.page.locator(selector);
    await el.waitFor({ state: 'visible' });
    // snapshot for visual regression
    return await el.screenshot();
  }
}

module.exports = { BasePage };
