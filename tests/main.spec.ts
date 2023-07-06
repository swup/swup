import { test, expect } from '@playwright/test';

import type Swup from '../src/Swup.js';

import {
	clickOnLink,
	expectRequestHeaders,
	expectToBeAt,
	expectToHaveCacheEntry,
	expectToHaveReloadedAfterAction,
	loadWithSwup
} from './support/commands.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/page-1.html');
})

test.describe('request', () => {
	// test('arrives', async ({ page }) => {
	// 	await expectToBeAt(page, '/page-1.html', 'Page 1');
	// });

	// test('visits', async ({ page }) => {
	// 	await clickOnLink(page, '/page-2.html');
	// 	await expectToBeAt(page, '/page-2.html', 'Page 2');
	// });

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

	test('should force-load on server error', async ({ page }) => {
		await page.route('/error-500.html', route => route.fulfill({ status: 500 }));
		await expectToHaveReloadedAfterAction(page, async () => {
			await loadWithSwup(page, '/error-500.html');
		});
		await expectToBeAt(page, '/error-500.html');
	});

	// test('should force-load on network error', async ({ page }) => {
	// 	await page.route('/error-network.html', route => route.abort('failed'));
	// 	await expectToHaveReloadedAfterAction(page, async () => {
	// 		await loadWithSwup(page, '/error-network.html');
	// 	});
	// 	await expectToBeAt(page, '/error-network.html');
	// });
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
