import { defineConfig } from '@playwright/test';

/**
 * Playwright config for merging blob reports.
 */

export default defineConfig({
  reporter: [
    ['html', { open: 'never' }],
    ['../reporters/markdown-reporter.ts'],
  ]
});
