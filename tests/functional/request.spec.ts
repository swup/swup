import { test } from '@playwright/test';

import { clickOnLink, expectPageReload, expectRequestHeaders, expectToBeAt } from '../support/commands.js';
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

	test('forces reload on network error', async ({ page }) => {
		await page.route('/error-network.html', route => route.abort(), { times: 1 });
		await expectPageReload(page, () => navigateWithSwup(page, '/error-network.html'));
		await expectToBeAt(page, '/error-network.html');
	});
});
