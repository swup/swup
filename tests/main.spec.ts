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

  test('should send the correct referer', async ({ page, baseURL }) => {
    const referer = `${baseURL}/page-1.html`;
    const [request] = await Promise.all([
      page.waitForRequest((request) => request.url().endsWith('/page-2.html')),
      page.click('a[href="/page-2.html"]')
    ]);
    expect(request.headers()).toHaveProperty('referer', referer);
  });

  test('should send the correct request headers', async ({ page }) => {
    const [request] = await Promise.all([
      page.waitForRequest((request) => request.url().endsWith('/page-2.html')),
      page.click('a[href="/page-2.html"]')
    ]);
    expect(request.headers()).toMatchObject({
      'x-requested-with': 'swup',
      'accept': 'text/html, application/xhtml+xml'
    });
  });
});
