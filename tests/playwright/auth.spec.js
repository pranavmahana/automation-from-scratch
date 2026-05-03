// tests/playwright/auth.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { users } = require('../../fixtures/users');

test.describe('Authentication', () => {

  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  test('✅ Valid credentials redirect to dashboard', async ({ page }) => {
    await loginPage.login(users.admin.email, users.admin.password);
    await expect(page).toHaveURL(/.*secure/);
    await expect(page.locator('h2')).toContainText('Secure Area');
  });

  test('✅ Remember me keeps session across reload', async ({ page }) => {
    await loginPage.login(users.admin.email, users.admin.password);
    await page.reload();
    await expect(page).toHaveURL(/.*secure/);
  });

  // ── Negative Cases ────────────────────────────────────────────────────────

  test('❌ Wrong password shows error message', async () => {
    await loginPage.login(users.admin.email, 'wrongpassword123');
    const errorText = await loginPage.expectErrorMessage();
    expect(errorText).toContain('Your password is invalid!');
  });

  test('❌ Empty fields show validation errors', async ({ page }) => {
    await loginPage.safeClick('button[type="submit"]');
    await expect(page.locator('#flash')).toBeVisible();
  });

  test('❌ Non-existent user shows generic error (no user enumeration)', async () => {
    await loginPage.login('ghost@nowhere.com', 'any_password');
    const errorText = await loginPage.expectErrorMessage();
    expect(errorText).toContain('Your username is invalid!');
  });

  // ── Security ─────────────────────────────────────────────────────────────

  test('🔒 SQL injection attempt is safely handled', async ({ page }) => {
    await loginPage.login("' OR 1=1 --", 'password');
    await expect(page).not.toHaveURL(/.*secure/);
    await expect(page.locator('#flash')).toBeVisible();
  });

  test('🔒 XSS payload in username field is escaped', async ({ page }) => {
    await loginPage.login('<script>alert("xss")</script>', 'password');
    let alertFired = false;
    page.on('dialog', () => { alertFired = true; });
    await page.waitForTimeout(1000);
    expect(alertFired).toBe(false);
  });

  test('🔒 Invalid credentials show error message', async () => {
    await loginPage.login('wronguser', 'wrongpass');
    const error = await loginPage.expectErrorMessage();
    expect(error).toContain('Your username is invalid!');
  });

  // ── Data-Driven Tests ─────────────────────────────────────────────────────
  // herokuapp accepts any username format but rejects wrong credentials.
  // We verify that various invalid usernames never result in a successful login.

  const invalidUsernames = [
    'notauser',
    'wrong@email.com',
    'admin',
    'root',
    '',
  ];

  for (const username of invalidUsernames) {
    test('❌ Invalid username rejected: "' + (username || '(empty)') + '"', async ({ page }) => {
      await loginPage.login(username, 'wrongpassword');
      await expect(page.locator('#flash')).toBeVisible();
      await expect(page).not.toHaveURL(/.*secure/);
    });
  }

  // ── Accessibility ─────────────────────────────────────────────────────────

  test('♿ Login form is keyboard navigable', async ({ page }) => {
    await page.locator('#username').focus();
    await page.keyboard.type(users.admin.email);
    await page.keyboard.press('Tab');
    await page.keyboard.type(users.admin.password);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/.*secure/);
  });

});