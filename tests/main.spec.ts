import { test, expect, type Page } from '@playwright/test';

import Swup from '../src/Swup.js';

declare global {
  interface Window {
    _swup: Swup;
  }
}

function swup(page: Page) {
  return page.evaluate(() => window._swup);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/page-1.html', { waitUntil: 'load' });
})

test.describe('request', () => {
  test('arrives', async ({ page }) => {
    await expect(page).toHaveURL('/page-1.html');
    await expect(page).toHaveTitle('Page 1');
  });

  test('visits', async ({ page }) => {
    await page.click('a[href="/page-2.html"]');
    await expect(page).toHaveURL('/page-2.html');
    await expect(page).toHaveTitle('Page 2');
  });
});
