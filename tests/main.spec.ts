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
    const headers = await page.evaluate(() => window._swup.options.requestHeaders);
    const expected = Object.fromEntries(
      Object.entries(headers).map(([header, value]) => [header.toLowerCase(), value])
    );
    expect(request.headers()).toMatchObject(expected);
  });
});

test.describe('cache', () => {
  test('should cache pages', async ({ page }) => {
    await page.evaluate(() => window._swup.loadPage('/page-2.html'));
    await expect(page).toHaveURL('/page-2.html');
    await expect(page).toHaveTitle('Page 2');
    const exists = await page.evaluate(() => window._swup.cache.has('/page-2.html'));
    const entry = await page.evaluate(() => window._swup.cache.get('/page-2.html'));
    expect(exists).toBe(true);
    expect(entry).toHaveProperty('url', '/page-2.html');
	});

  test('should cache pages from absolute URLs', async ({ page, baseURL }) => {
    await page.evaluate((baseURL) => window._swup.loadPage(`${baseURL}/page-2.html`), baseURL);
    await expect(page).toHaveURL('/page-2.html');
    await expect(page).toHaveTitle('Page 2');
    const exists = await page.evaluate(() => window._swup.cache.has('/page-2.html'));
    const entry = await page.evaluate(() => window._swup.cache.get('/page-2.html'));
    expect(exists).toBe(true);
    expect(entry).toHaveProperty('url', '/page-2.html');
	});
});
