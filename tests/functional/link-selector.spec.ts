import { test } from '@playwright/test';

import { expectNoPageReload, expectPageReload, expectToBeAt } from '../support/commands.js';

test.describe('link selector', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/link-selector.html');
	});

	test('ignores SVG links by default', async ({ page }) => {
		await expectPageReload(page, () => page.locator('svg a').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('follow SVG links when added to selector', async ({ page }) => {
		await page.evaluate(() => window._swup.options.linkSelector = 'a[href], svg a[*|href]');
		await expectNoPageReload(page, () => page.locator('svg a').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});
});
