// tests/playwright/api/api.spec.js
const { test, expect, request } = require('@playwright/test');

/**
 * API TEST SUITE
 *
 * Pure API testing with Playwright's APIRequestContext.
 * No browser, no UI — fast, lightweight, runs in milliseconds.
 *
 * Tests: CRUD operations, auth headers, response schema, error codes.
 * Pattern: mirrors Postman collections but version-controlled & CI-integrated.
 */

const BASE_URL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

test.describe('REST API — Users Endpoint', () => {

  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN || 'test-token'}`,
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // ── GET ───────────────────────────────────────────────────────────────────

  test('GET /users returns 200 with array', async () => {
    const response = await apiContext.get('/users');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /users/:id returns correct user schema', async () => {
    const response = await apiContext.get('/users/1');
    expect(response.status()).toBe(200);

    const user = await response.json();

    // Schema validation — every field must exist and be the right type
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // valid email format
    expect(typeof user.address).toBe('object');
  });

  test('GET /users/999 returns 404 for non-existent user', async () => {
    const response = await apiContext.get('/users/999');
    expect(response.status()).toBe(404);
  });

  // ── POST ──────────────────────────────────────────────────────────────────

  test('POST /users creates resource and returns 201', async () => {
    const newUser = {
      name: 'Jane Automation',
      email: 'jane.auto@testlab.com',
      phone: '555-1234',
      website: 'qa-automation.dev',
    };

    const response = await apiContext.post('/users', { data: newUser });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created.name).toBe(newUser.name);
    expect(created.email).toBe(newUser.email);
    expect(created.id).toBeDefined(); // server assigns ID
  });

  test('POST /users with missing required field returns 400', async () => {
    const response = await apiContext.post('/users', {
      data: { email: 'nope@test.com' }, // missing name
    });
    // Expect validation error
    expect([400, 422]).toContain(response.status());
  });

  // ── PUT / PATCH ───────────────────────────────────────────────────────────

  test('PUT /users/:id replaces entire resource', async () => {
    const updated = { name: 'Updated Name', email: 'updated@test.com' };
    const response = await apiContext.put('/users/1', { data: updated });
    expect(response.status()).toBe(200);
  });

  test('PATCH /users/:id updates only specified fields', async () => {
    const response = await apiContext.patch('/users/1', {
      data: { name: 'Patched Name' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('Patched Name');
  });

  // ── DELETE ────────────────────────────────────────────────────────────────

  test('DELETE /users/:id returns 200 or 204', async () => {
    const response = await apiContext.delete('/users/1');
    expect([200, 204]).toContain(response.status());
  });

  // ── Response Headers ─────────────────────────────────────────────────────

  test('Response includes correct Content-Type header', async () => {
    const response = await apiContext.get('/users/1');
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('Response time is under 2 seconds', async () => {
    const start = Date.now();
    await apiContext.get('/users');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  // ── Posts Sub-resource ────────────────────────────────────────────────────

  test('GET /users/:id/posts returns user-specific posts', async () => {
    const response = await apiContext.get('/users/1/posts');
    expect(response.status()).toBe(200);
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

});
