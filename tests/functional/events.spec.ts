import { test, expect } from '@playwright/test';

import { clickOnLink } from '../support/commands.js';

test.describe('events', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('triggers custom dom events on document', async ({ page }) => {
		await page.evaluate(() => {
			document.addEventListener(
				'swup:link:click',
				(event: any) => (window.data = event.detail.hook)
			);
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual('link:click');
	});

	test('custom dom events bubble to window', async ({ page }) => {
		await page.evaluate(() => {
			window.addEventListener(
				'swup:link:click',
				(event: any) => (window.data = event.detail.hook)
			);
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual('link:click');
	});

	test('triggers dom events for "swup:all"', async ({ page }) => {
		await page.evaluate(() => {
			document.addEventListener('swup:all', (event: any) => {
				if (event.detail.hook === 'link:click') window.data = event.detail.hook;
			});
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual('link:click');
	});

	test('prevents the default click event', async ({ page }) => {
		await page.evaluate(() => {
			document.documentElement.addEventListener(
				'click',
				(event) => (window.data = event.defaultPrevented)
			);
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual(true);
	});
});
