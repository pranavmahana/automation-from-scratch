<<<<<<< HEAD
# 🎯 QA Automation Portfolio
### Playwright · Selenium · CI/CD · Page Object Model · API Testing

> A production-grade test automation framework demonstrating real-world QA engineering skills — built to showcase what I can deliver from day one.

---

## 📋 What This Project Demonstrates

| Skill | Implementation |
|-------|---------------|
| **Playwright** | E2E tests, API tests, visual regression, network mocking |
| **Selenium** | Cross-browser, explicit waits, JS executor, keyboard control |
| **Page Object Model** | `BasePage` → `LoginPage`, `DashboardPage` hierarchy |
| **CI/CD** | GitHub Actions: lint → test (matrix) → merge reports → notify |
| **API Testing** | Full CRUD coverage, schema validation, response time assertions |
| **Data-Driven Tests** | Fixtures, parameterised loops, environment-based configs |
| **Security Testing** | SQL injection, XSS, user enumeration, account lockout |
| **Performance** | Load time assertions, API response time checks |
| **Reporting** | HTML report, JUnit XML, JSON — all CI-integrated |
| **Auth Optimization** | `storageState` — one login, all tests (5x speed boost) |

---

## 🏗️ Project Structure

```
qa-automation-portfolio/
├── .github/
│   └── workflows/
│       └── qa-pipeline.yml       # Full CI/CD: lint → E2E → report → notify
│
├── pages/                        # Page Object Model
│   ├── BasePage.js               # Abstract base: safe click, fill, waits, mocking
│   ├── LoginPage.js              # Login: credentials, MFA, social auth
│   └── DashboardPage.js          # Dashboard: table, search, filter, modals
│
├── tests/
│   ├── playwright/
│   │   ├── auth.spec.js          # Login: happy path, security, a11y, data-driven
│   │   ├── dashboard.spec.js     # Dashboard: table, modals, performance, visual
│   │   └── api/
│   │       └── api.spec.js       # REST API: CRUD, schema, headers, timing
│   └── selenium/
│       ├── login.test.js         # Selenium 4: waits, JS executor, keyboard
│       └── runner.js             # Headless runner with results summary
│
├── utils/
│   └── authHelper.js             # storageState manager + mock auth generator
│
├── fixtures/
│   └── users.js                  # Test data: roles, edge cases, injection payloads
│
├── playwright.config.js          # Multi-browser, sharding, reporters, retries
├── package.json
└── .env.example
```

---

## 🚀 Quick Start

```bash
# Install
npm install
npx playwright install

# Run all Playwright tests
npm run test:playwright

# Run with UI (great for debugging)
npm run test:playwright:ui

# Run Playwright in headed mode (watch the browser)
npm run test:playwright:headed

# Run Selenium tests
npm run test:selenium

# View HTML report
npm run report
```

---

## 🔑 Key Design Decisions

### Why Page Object Model?
```
❌ Without POM:              ✅ With POM:
page.click('#username')      loginPage.login(email, pass)
page.fill('#password', ...)  
page.click('[type=submit]')  
// repeated in 20 test files // ONE function call everywhere
```
When a selector changes, you update **one file**, not 20 tests.

### Why storageState for Auth?
```
Without storageState: 50 tests × 3s login each = 2.5 minutes of login time
With storageState:    Login ONCE, reuse in all 50 tests = 3 seconds total
```

### Why parallel + sharding in CI?
```
Sequential (1 worker): 100 tests × 3 browsers = ~45 minutes
Parallel + sharded:    Same suite = ~6 minutes
```

---

## 🌐 Browser Coverage

| Browser | Playwright | Selenium |
|---------|-----------|---------|
| Chrome/Chromium | ✅ | ✅ |
| Firefox | ✅ | ✅ (configurable) |
| Safari/WebKit | ✅ | - |
| Mobile Chrome | ✅ | - |
| Mobile Safari | ✅ | - |

---

## 📊 CI/CD Pipeline Overview

```
Push/PR to main
     │
     ▼
[Lint & Format]          ← ESLint + Prettier
     │
     ├──────────────────────────────────────┐
     ▼                                      ▼
[Playwright E2E]                       [API Tests]
  Chrome × 3 shards                    Playwright request
  Firefox × 3 shards        +         context (no browser)
  WebKit × 3 shards                         │
     │                                      ▼
     │                              [Selenium Tests]
     ▼                                    Chrome
[Merge Reports]
HTML + JUnit + JSON
     │
     ├─── GitHub Pages (main branch)
     └─── Slack notification on failure
```

---

## 🔒 Environment Variables

```env
# .env (never commit — see .env.example)
BASE_URL=https://staging.yourapp.com
ADMIN_EMAIL=admin@testapp.com
ADMIN_PASS=YourSecurePassword
API_BASE_URL=https://api.yourapp.com
API_TOKEN=your-api-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## 📈 Test Categories

| Category | Count | Notes |
|----------|-------|-------|
| Authentication | 10+ | Happy path, security, data-driven |
| Dashboard E2E | 12+ | CRUD, performance, visual regression |
| API Tests | 10+ | CRUD, schema, headers, timing |
| Selenium | 4+ | Cross-browser, keyboard, JS executor |
| **Total** | **36+** | Across 3 browsers = 100+ runs per CI |

---

## 🛠️ Tech Stack

- **Test Framework**: Playwright `^1.44`, Selenium WebDriver `^4.18`
- **Language**: JavaScript (Node.js 20)
- **CI/CD**: GitHub Actions
- **Reporting**: Playwright HTML, JUnit XML, Allure (optional)
- **Data**: `@faker-js/faker` for dynamic test data
- **Secrets**: GitHub Secrets / `.env`

---

*Built with the goal of making QA automation a first-class citizen in any engineering team.*
=======
# qa-automation-portfolio
>>>>>>> b53abe4de027e9dadbe44e220e5c917485e6dc60
