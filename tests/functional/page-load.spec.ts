import { test } from '@playwright/test';

import { expectToBeAt } from '../support/commands.js';
import { navigateWithSwup } from '../support/swup.js';

test.describe('page load', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('allows calling original page:load handler', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.replace('page:load', (visit, args, defaultHandler) => defaultHandler!(visit, args));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('accepts a page object from page:load', async ({ page }) => {
		await page.evaluate(() => {
			const page = { url: '/page-3.html', html: '<html><head><title>Page 3</title></head><body><div id="swup"><h1>Page 3</h1></div></body></html>' };
			window._swup.hooks.replace('page:load', async () => page);
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});

	test('accepts a fetch request from page:load', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.replace('page:load', () => window._swup.fetchPage('page-3.html'));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});
});
