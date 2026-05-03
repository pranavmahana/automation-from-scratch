// pages/DashboardPage.js
const { BasePage } = require('./BasePage');

/**
 * DASHBOARD PAGE OBJECT
 *
 * Covers a complex, data-rich page — tables, filters, modals, infinite scroll.
 * This is where senior QA engineers prove their value:
 * handling dynamic DOM, race conditions, async updates.
 */
class DashboardPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      // Navigation
      navItems:         '[data-testid="nav-item"]',
      userMenu:         '[data-testid="user-menu"]',
      logoutBtn:        '[data-testid="logout"]',

      // Stats cards
      statsCards:       '[data-testid="stat-card"]',
      totalRevenueCard: '[data-testid="stat-revenue"]',
      activeUsersCard:  '[data-testid="stat-users"]',

      // Data table
      dataTable:        '[data-testid="data-table"]',
      tableRows:        '[data-testid="table-row"]',
      tableHeaders:     'thead th',
      searchInput:      '[data-testid="table-search"]',
      filterDropdown:   '[data-testid="filter-dropdown"]',
      paginationNext:   '[data-testid="page-next"]',
      paginationPrev:   '[data-testid="page-prev"]',
      pageInfo:         '[data-testid="page-info"]',

      // Modals
      createBtn:        '[data-testid="create-btn"]',
      modalOverlay:     '[data-testid="modal"]',
      modalSubmit:      '[data-testid="modal-submit"]',
      modalClose:       '[data-testid="modal-close"]',

      // Notifications
      toastSuccess:     '[data-testid="toast-success"]',
      toastError:       '[data-testid="toast-error"]',
    };
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigate() {
    await super.navigate('/dashboard');
    await this.waitForDashboardLoad();
  }

  async waitForDashboardLoad() {
    await this.page.waitForSelector(this.selectors.dataTable, { timeout: 15_000 });
    // Wait for network idle — ensures API data is loaded
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Stats Cards ───────────────────────────────────────────────────────────

  async getStatCardValues() {
    const cards = await this.page.locator(this.selectors.statsCards).all();
    const values = [];
    for (const card of cards) {
      values.push(await card.innerText());
    }
    return values;
  }

  async waitForStatsToLoad() {
    // Wait for shimmer/skeleton loaders to disappear
    await this.page.waitForSelector('[data-loading="true"]', { state: 'detached', timeout: 10_000 })
      .catch(() => {}); // skeleton may not exist in all states
  }

  // ─── Table Operations ─────────────────────────────────────────────────────

  async searchTable(query) {
    await this.safeFill(this.selectors.searchInput, query);
    // Debounce — wait for API response after typing
    await this.page.waitForTimeout(300);
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount() {
    return await this.page.locator(this.selectors.tableRows).count();
  }

  async getRowData(rowIndex = 0) {
    const row = this.page.locator(this.selectors.tableRows).nth(rowIndex);
    const cells = await row.locator('td').all();
    const data = [];
    for (const cell of cells) {
      data.push(await cell.innerText());
    }
    return data;
  }

  async sortByColumn(columnName) {
    const headers = this.page.locator(this.selectors.tableHeaders);
    await headers.getByText(columnName).click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterBy(value) {
    await this.safeClick(this.selectors.filterDropdown);
    await this.page.getByRole('option', { name: value }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToNextPage() {
    await this.safeClick(this.selectors.paginationNext);
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Modal Operations ─────────────────────────────────────────────────────

  async openCreateModal() {
    await this.safeClick(this.selectors.createBtn);
    await this.page.waitForSelector(this.selectors.modalOverlay, { state: 'visible' });
  }

  async closeModal() {
    await this.safeClick(this.selectors.modalClose);
    await this.page.waitForSelector(this.selectors.modalOverlay, { state: 'detached' });
  }

  async submitModal() {
    await this.safeClick(this.selectors.modalSubmit);
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  async waitForSuccessToast() {
    await this.page.waitForSelector(this.selectors.toastSuccess, { state: 'visible', timeout: 8_000 });
    return await this.getText(this.selectors.toastSuccess);
  }

  async waitForErrorToast() {
    await this.page.waitForSelector(this.selectors.toastError, { state: 'visible', timeout: 8_000 });
    return await this.getText(this.selectors.toastError);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout() {
    await this.safeClick(this.selectors.userMenu);
    await this.safeClick(this.selectors.logoutBtn);
    await this.page.waitForURL('**/login');
  }
}

module.exports = { DashboardPage };
