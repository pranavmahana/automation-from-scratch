// tests/selenium/runner.js
const { SeleniumLoginTest } = require('./login.test');

async function runAll() {
  const suite = new SeleniumLoginTest('chrome');
  const results = await suite.run();
  process.exit(results.failed > 0 ? 1 : 0);
}

runAll().catch(err => {
  console.error('Runner error:', err);
  process.exit(1);
});
