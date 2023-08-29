import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const baseURL = 'http://localhost:8274';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Directory containing the test files */
  testDir: '../functional',
  /* Folder for test artifacts: screenshots, videos, ... */
  outputDir: '../results',
  /* Timeout individual tests after 5 seconds */
  timeout: 5_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Limit parallel workers on CI, use default locally. */
  workers: process.env.CI ? 4 : undefined,
  // Limit the number of failures on CI to save resources
  maxFailures: process.env.CI ? 10 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [
    ['dot'],
    ['github'],
    ['html', { outputFolder: '../reports/html', open: 'never' }],
    ['json', { outputFile: '../reports/json/report.json' }],
    ['blob', { outputDir: '../reports/blobs' }],
  ] : [
    ['list'],
    ['html', { outputFolder: '../reports/html', open: 'on-failure' }],
  ],

  expect: {
    /* Timeout async expect matchers after 2 seconds */
    timeout: 3_000,
  },

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Capture screenshot after each test failure. */
    screenshot: 'only-on-failure',
    /* Capture video if failed tests. */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    url: baseURL,
    command: 'npm run test:e2e:start',
    reuseExistingServer: !process.env.CI,
  },
});
