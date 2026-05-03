// tests/playwright/dashboard.spec.js
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../pages/DashboardPage');
const { authHelper } = require('../../utils/authHelper');

/**
 * DASHBOARD TEST SUITE
 *
 * Demonstrates:
 *  - storageState auth (fastest login — reuses saved session)
 *  - API mocking for deterministic table data
 *  - Visual regression snapshot testing
 *  - Performance assertions
 *  - Complex user flows: search → filter → sort → paginate
 */

// Reuse login session across all dashboard tests
// This is a key optimization: login once, test many — saves minutes in CI
test.use({ storageState: './fixtures/auth-state.json' });

test.describe('Dashboard', () => {

  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);

    // Mock the data API for deterministic results
    await dashboard.mockAPI('**/api/v1/records*', {
      data: [
        { id: 1, name: 'Acme Corp', status: 'active', revenue: 54200, region: 'APAC' },
        { id: 2, name: 'Globex Ltd', status: 'inactive', revenue: 31100, region: 'EU' },
        { id: 3, name: 'Initech', status: 'active', revenue: 88900, region: 'US' },
      ],
      total: 3,
      page: 1,
    });

    await dashboard.navigate();
  });

  // ── Load & Display ─────────────────────────────────────────────────────────

  test('✅ Dashboard loads and displays all stat cards', async ({ page }) => {
    await dashboard.waitForStatsToLoad();
    const cards = await dashboard.getStatCardValues();
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  test('✅ Data table renders correct row count', async () => {
    const rowCount = await dashboard.getRowCount();
    expect(rowCount).toBe(3);
  });

  test('✅ Table headers are present and correct', async ({ page }) => {
    const headers = ['Name', 'Status', 'Revenue', 'Region'];
    for (const header of headers) {
      await expect(page.locator('thead').getByText(header)).toBeVisible();
    }
  });

  // ── Search & Filter ────────────────────────────────────────────────────────

  test('✅ Search filters table results in real-time', async () => {
    await dashboard.searchTable('Acme');
    const rowCount = await dashboard.getRowCount();
    expect(rowCount).toBe(1);
    const row = await dashboard.getRowData(0);
    expect(row[1]).toBe('Acme Corp');
  });

  test('✅ Empty search shows all results', async () => {
    await dashboard.searchTable('xyz_no_results_xyz');
    const emptyCount = await dashboard.getRowCount();
    expect(emptyCount).toBe(0);

    await dashboard.searchTable(''); // clear
    const fullCount = await dashboard.getRowCount();
    expect(fullCount).toBe(3);
  });

  test('✅ Filter by region shows correct rows', async ({ page }) => {
    await dashboard.filterBy('APAC');
    const rowCount = await dashboard.getRowCount();
    expect(rowCount).toBe(1);
  });

  // ── Sorting ────────────────────────────────────────────────────────────────

  test('✅ Clicking Revenue column sorts ascending', async ({ page }) => {
    await dashboard.sortByColumn('Revenue');
    const rows = await page.locator('[data-testid="table-row"] td:nth-child(4)').allInnerTexts();
    const values = rows.map(v => parseInt(v.replace(/[^0-9]/g, '')));
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  // ── Modals ────────────────────────────────────────────────────────────────

  test('✅ Create modal opens and closes correctly', async ({ page }) => {
    await dashboard.openCreateModal();
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await dashboard.closeModal();
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });

  // ── Performance ───────────────────────────────────────────────────────────

  test('⚡ Dashboard loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await dashboard.navigate();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('⚡ Search responds within 500ms', async ({ page }) => {
    const startTime = Date.now();
    await dashboard.searchTable('Acme');
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(500);
  });

  // ── Visual Regression ─────────────────────────────────────────────────────

  test('📸 Dashboard layout matches snapshot', async ({ page }) => {
    await dashboard.waitForStatsToLoad();
    await expect(page).toHaveScreenshot('dashboard-layout.png', {
      maxDiffPixels: 100,
      threshold: 0.1,
    });
  });

  // ── Network Interception ──────────────────────────────────────────────────

  test('🔌 Handles API failure gracefully', async ({ page }) => {
    // Simulate server error
    await page.route('**/api/v1/records*', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    );
    await dashboard.navigate();
    await expect(page.locator('[data-testid="error-banner"]')).toBeVisible();
  });

  test('🔌 Handles slow API with loading state', async ({ page }) => {
    await page.route('**/api/v1/records*', async route => {
      await new Promise(r => setTimeout(r, 2000)); // simulate slow API
      await route.continue();
    });
    await dashboard.navigate();
    // Loading skeleton should appear during the delay
    await expect(page.locator('[data-loading="true"]')).toBeVisible();
  });

});
