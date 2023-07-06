import { test, expect } from '@playwright/test';

import type Swup from '../src/Swup.js';

import {
	clickOnLink,
	expectRequestHeaders,
	expectToBeAt,
	expectToHaveCacheEntry,
	loadWithSwup
} from './support/commands.js';


declare global {
	interface Window {
		_swup: Swup;
	}
}

test.beforeEach(async ({ page }) => {
	await page.goto('/page-1.html', { waitUntil: 'load' });
})

test.describe('request', () => {
	test('arrives', async ({ page }) => {
		await expectToBeAt(page, '/page-1.html', 'Page 1');
	});

	test('visits', async ({ page }) => {
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('should send the correct referer', async ({ page, baseURL }) => {
		const referer = `${baseURL}/page-1.html`;
		const [request] = await Promise.all([
			page.waitForRequest('/page-2.html'),
			clickOnLink(page, '/page-2.html')
		]);
		expectRequestHeaders(request, { referer });
	});

	test('should send the correct request headers', async ({ page }) => {
		const [request] = await Promise.all([
			page.waitForRequest('/page-2.html'),
			clickOnLink(page, '/page-2.html')
		]);
		const headers = await page.evaluate(() => window._swup.options.requestHeaders);
		expectRequestHeaders(request, headers);
	});
});

test.describe('cache', () => {
	test('should cache pages', async ({ page }) => {
		await loadWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectToHaveCacheEntry(page, '/page-2.html');
	});

	test('should cache pages from absolute URLs', async ({ page, baseURL }) => {
		await loadWithSwup(page, `${baseURL}/page-2.html`);
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectToHaveCacheEntry(page, '/page-2.html');
	});
});
