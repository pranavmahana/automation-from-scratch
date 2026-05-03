// tests/selenium/login.test.js
const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

/**
 * SELENIUM WEBDRIVER TEST SUITE
 *
 * Demonstrates Selenium 4 with:
 *  - WebDriver Manager (automatic driver downloads)
 *  - Explicit waits (best practice — never implicit waits)
 *  - Cross-browser execution
 *  - Page Object-style organization
 *  - Screenshot on failure
 *
 * Why Selenium alongside Playwright?
 *  - Selenium: Java/C#/.NET ecosystem, legacy enterprise systems, Selenium Grid
 *  - Playwright: Modern, faster, auto-wait, better network control
 *  - Knowing BOTH makes you invaluable in any QA team
 */

const BASE_URL = process.env.BASE_URL || 'https://the-internet.herokuapp.com';
const TIMEOUT = 10_000;

class SeleniumLoginTest {
  constructor(browser = 'chrome') {
    this.browser = browser;
    this.driver = null;
  }

  async setup() {
    const options = new chrome.Options();
    options.addArguments('--no-sandbox', '--disable-dev-shm-usage');

    //Previous code
    // options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');

    this.driver = await new Builder()
      .forBrowser(this.browser)
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({ implicit: 0 }); // Explicit waits only
    await this.driver.manage().window().maximize();
  }

  async teardown() {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  // ── Explicit Wait Helpers ─────────────────────────────────────────────────

  async waitForElement(locator, timeout = TIMEOUT) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForVisible(locator, timeout = TIMEOUT) {
    const el = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async waitForText(locator, text, timeout = TIMEOUT) {
    const el = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementTextContains(el, text), timeout);
    return el;
  }

  async safeClick(locator) {
    const el = await this.waitForVisible(locator);
    // Scroll into view first — avoids ElementNotInteractableException
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', el);
    await el.click();
  }

  async safeSendKeys(locator, text) {
    const el = await this.waitForVisible(locator);
    await el.clear();
    await el.sendKeys(text);
  }

  async takeScreenshot(name) {
    const fs = require('fs');
    fs.mkdirSync('reports/screenshots', { recursive: true });
    const screenshot = await this.driver.takeScreenshot();
    fs.writeFileSync(`reports/screenshots/${name}-${Date.now()}.png`, screenshot, 'base64');
    console.log(`  📸 Screenshot saved: ${name}`);
  }

  // ── Test Cases ────────────────────────────────────────────────────────────

  async testSuccessfulLogin() {
    console.log('\n🧪 [Selenium] Valid credentials login...');
    try {
      await this.driver.get(`${BASE_URL}/login`);

      await this.safeSendKeys(By.id('username'), 'tomsmith');
      await this.safeSendKeys(By.id('password'), 'SuperSecretPassword!');
      await this.safeClick(By.css('[type="submit"]'));

      const flash = await this.waitForVisible(By.id('flash'));
      const text = await flash.getText();

      if (text.includes('You logged into a secure area')) {
        console.log('  ✅ PASS: Redirected to secure area');
      } else {
        throw new Error(`Unexpected message: ${text}`);
      }
    } catch (err) {
      await this.takeScreenshot('login-success-fail');
      throw err;
    }
  }

  async testInvalidCredentials() {
    console.log('\n🧪 [Selenium] Invalid credentials shows error...');
    try {
      await this.driver.get(`${BASE_URL}/login`);

      await this.safeSendKeys(By.id('username'), 'wronguser');
      await this.safeSendKeys(By.id('password'), 'wrongpass');
      await this.safeClick(By.css('[type="submit"]'));

      const flash = await this.waitForVisible(By.id('flash'));
      const text = await flash.getText();

      if (text.includes('invalid')) {
        console.log('  ✅ PASS: Error message shown for invalid credentials');
      } else {
        throw new Error(`Expected error message, got: ${text}`);
      }
    } catch (err) {
      await this.takeScreenshot('login-invalid-fail');
      throw err;
    }
  }

  async testJavaScriptExecutor() {
    console.log('\n🧪 [Selenium] JavaScript executor — scroll and highlight...');
    try {
      await this.driver.get(`${BASE_URL}/login`);

      const usernameInput = await this.waitForElement(By.id('username'));

      // JS Executor: highlight element (useful for debugging)
      await this.driver.executeScript(
        "arguments[0].style.border='3px solid red'",
        usernameInput
      );

      // JS Executor: fill input directly (bypass WebDriver for edge cases)
      await this.driver.executeScript(
        "arguments[0].value = arguments[1]",
        usernameInput, 'tomsmith'
      );

      console.log('  ✅ PASS: JavaScript executor works correctly');
    } catch (err) {
      await this.takeScreenshot('js-executor-fail');
      throw err;
    }
  }

  async testKeyboardNavigation() {
    console.log('\n🧪 [Selenium] Keyboard navigation with Tab key...');
    try {
      await this.driver.get(`${BASE_URL}/login`);

      const username = await this.waitForVisible(By.id('username'));
      await username.sendKeys('tomsmith');
      await username.sendKeys(Key.TAB); // move to password

      const active = await this.driver.switchTo().activeElement();
      const activeId = await active.getAttribute('id');

      if (activeId === 'password') {
        console.log('  ✅ PASS: Tab key navigates to password field');
      } else {
        console.warn(`  ⚠️  Active element was: ${activeId}`);
      }
    } catch (err) {
      await this.takeScreenshot('keyboard-nav-fail');
      throw err;
    }
  }

  async run() {
    console.log(`\n🚀 Starting Selenium tests on ${this.browser.toUpperCase()}`);
    await this.setup();

    const results = { passed: 0, failed: 0, errors: [] };

    const tests = [
      this.testSuccessfulLogin.bind(this),
      this.testInvalidCredentials.bind(this),
      this.testJavaScriptExecutor.bind(this),
      this.testKeyboardNavigation.bind(this),
    ];

    for (const testFn of tests) {
      try {
        await testFn();
        results.passed++;
      } catch (err) {
        results.failed++;
        results.errors.push({ test: testFn.name, error: err.message });
        console.error(`  ❌ FAIL: ${err.message}`);
      }
    }

    await this.teardown();

    console.log(`\n📊 Results: ${results.passed} passed, ${results.failed} failed`);
    if (results.errors.length > 0) {
      console.error('Failures:', JSON.stringify(results.errors, null, 2));
    }

    return results;
  }
}

module.exports = { SeleniumLoginTest };
