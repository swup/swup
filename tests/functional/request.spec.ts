import { test, expect } from '@playwright/test';

import { clickOnLink, delayRequest, expectPageReload, expectRequestHeaders, expectToBeAt } from '../support/commands.js';
import { navigateWithSwup } from '../support/swup.js';

test.describe('request', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('sends the correct referer', async ({ page, baseURL }) => {
		const referer = `${baseURL}/page-1.html`;
		const [request] = await Promise.all([
			page.waitForRequest('/page-2.html'),
			clickOnLink(page, '/page-2.html')
		]);
		expectRequestHeaders(request, { referer });
	});

	test('sends the correct request headers', async ({ page }) => {
		const headers = await page.evaluate(() => window._swup.options.requestHeaders);
		const [request] = await Promise.all([
			page.waitForRequest('/page-2.html'),
			clickOnLink(page, '/page-2.html')
		]);
		expectRequestHeaders(request, headers);
	});

	test('forces reload on server error', async ({ page }) => {
		await page.route('/error-500.html', route => route.fulfill({ status: 500, body: '<!DOCTYPE html>' }));
		await expectPageReload(page, () => navigateWithSwup(page, '/error-500.html'));
		await expectToBeAt(page, '/error-500.html');
	});

	test('preserves the hash when forcing a reload on error', async ({ page }) => {
		await page.route('/error-500.html', route => route.fulfill({ status: 500, body: '<!DOCTYPE html>' }));
		await expectPageReload(page, () => navigateWithSwup(page, '/error-500.html#anchor'));
		await expectToBeAt(page, '/error-500.html#anchor');
	});

	test('forces reload on errors before the history update', async ({ page }) => {
		await page.evaluate(() => {
			window.history.pushState = () => { throw new Error('History update failed') };
		});
		await expectPageReload(page, () => navigateWithSwup(page, '/page-2.html'));
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		await expectToBeAt(page, '/page-1.html', 'Page 1');
	});

	test('allows replacing the visit:fail handler', async ({ page }) => {
		await page.route('/error-500.html', route => route.fulfill({ status: 500, body: '<!DOCTYPE html>' }));
		await page.evaluate(() => {
			window.data = false;
			window._swup.hooks.replace('visit:fail', (_visit, { error }) => {
				window.data = String(error);
			});
		});
		await navigateWithSwup(page, '/error-500.html');
		await page.waitForFunction(() => window.data !== false);
		expect(await page.evaluate(() => window.data)).toContain('/error-500.html');
		await expectToBeAt(page, '/error-500.html', 'Page 1');
	});

	test('forces reload on network error', async ({ page }) => {
		await page.route('/error-network.html', route => route.abort(), { times: 1 });
		await expectPageReload(page, () => navigateWithSwup(page, '/error-network.html'));
		await expectToBeAt(page, '/error-network.html');
	});

	test('forces reload on fetch timeout', async ({ page }) => {
		await delayRequest(page, '/page-2.html', 2000);
		await page.evaluate(() => window._swup.options.timeout = 500);
		await expectPageReload(page, () => navigateWithSwup(page, '/page-2.html'));
		await expectToBeAt(page, '/page-2.html');
	});
});
