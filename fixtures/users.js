// fixtures/users.js
/**
 * TEST FIXTURES — USER DATA
 *
 * Centralised test data. Never hardcode credentials in tests.
 * Real projects: pull from environment variables or a secrets manager (Vault, AWS Secrets Manager).
 *
 * Data categories:
 *  - users: role-based test accounts
 *  - invalidInputs: edge case inputs for negative testing
 *  - products: mock product data for E2E flows
 */

const users = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'tomsmith',
    password: process.env.ADMIN_PASS || 'SuperSecretPassword!',
    role: 'admin',
    displayName: 'Tom Smith',
  },
  viewer: {
    email: process.env.VIEWER_EMAIL || 'tomsmith',
    password: process.env.VIEWER_PASS || 'SuperSecretPassword!',
    role: 'viewer',
    displayName: 'Tom Smith',
  },
  locked: {
    email: 'locked.account@testapp.com',
    password: 'Any@Pass123!',
    role: 'locked',
    expectedError: 'Your username is invalid!',
  },
  expired: {
    email: 'expired.session@testapp.com',
    password: 'Expired@Pass123!',
    role: 'expired',
    expectedError: 'Your username is invalid!',
  },
};

const invalidInputs = {
  sqlInjection: ["' OR 1=1 --", "1; DROP TABLE users;--", "admin'--"],
  xss: ['<script>alert("xss")</script>', '<img src=x onerror=alert(1)>', 'javascript:void(0)'],
  longStrings: ['a'.repeat(256), 'a'.repeat(1000)],
  specialChars: ['!@#$%^&*()', '日本語テスト', '中文字符', 'العربية'],
  emails: {
    valid: ['test@example.com', 'test+filter@example.co.uk'],
    invalid: ['notanemail', '@nodomain', 'spaces in@email.com', ''],
  },
};

const products = [
  { id: 'P001', name: 'Laptop Pro 16"', category: 'Electronics', price: 1299.99, stock: 45 },
  { id: 'P002', name: 'Wireless Keyboard', category: 'Peripherals', price: 89.99, stock: 200 },
  { id: 'P003', name: 'USB-C Hub 7-in-1', category: 'Peripherals', price: 49.99, stock: 0 },
];

module.exports = { users, invalidInputs, products };
