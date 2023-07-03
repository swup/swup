import { test, expect, type Page } from '@playwright/test';

import type Swup from '../src/Swup.js';

declare global {
  interface Window {
    _swup: Swup;
  }
}

function withSwup(page: Page, cb: (swup: Swup) => any) {
  return page.evaluate(([cb]) => cb(window._swup), [cb]);
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

  test('should send the correct referer', async ({ page }) => {
    let referer = '';
    // await page.route('/page-2.html', async (route) => {
    //   console.log('Intercepted request:', route.request().url());
    //   const headers = await route.request().allHeaders();
    //   referer = headers.referer;
    // });
    let headers = {};
    const requestPromise = page.waitForRequest((request) => {
      if (request.url().includes('/page-2.html')) {
        headers = request.headers();
      }
      return true;
    });
    const clickPromise = page.click('a[href="/page-2.html"]');
    await Promise.all([requestPromise, clickPromise]);

    const expected = await withSwup(page, (swup) => swup.options.requestHeaders);
    Object.entries(expected).forEach(([header, value]) => {
      expect(headers).toHaveProperty(header.toLowerCase(), value);
    });
  });
});
