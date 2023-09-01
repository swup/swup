import { defineConfig } from '@playwright/test';

/**
 * Playwright config for merging blob reports.
 */

export default defineConfig({
  reporter: [
    ['html'],
    // ['../reporters/markdown-reporter.ts'],
  ]
});
