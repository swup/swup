import { test, expect } from '@playwright/test';

import { clickOnLink } from '../support/commands.js';

test.describe('events', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('triggers custom dom events', async ({ page }) => {
		await page.evaluate(() => {
			document.addEventListener('swup:link:click', (event) => window.data = event.detail.hook);
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual('link:click');
	});

	test('prevents the default click event', async ({ page }) => {
		await page.evaluate(() => {
			document.documentElement.addEventListener('click', (event) => window.data = event.defaultPrevented);
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual(true);
	});
});
