import { expect, test } from '@playwright/test';

import { clickOnLink, expectToBeAt } from '../support/commands.js';

test.describe('animation classes', () => {
	test("doesn't remove `is-leaving` until right before replacing the content", async ({
		page
	}) => {
		await page.goto('/page-1.html');
		await page.evaluate(() => {
			window.data = {};
			window._swup.hooks.before('content:replace', async (visit) => {
				window.data.before =
					window.document.documentElement.classList.contains('is-leaving');
			});
			window._swup.hooks.on('content:replace', async (visit) => {
				window.data.after =
					window.document.documentElement.classList.contains('is-leaving');
			});
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toEqual({
			before: true,
			after: false
		});
	});

	test("doesn't add `is-rendering` until right before replacing the content", async ({
		page
	}) => {
		await page.goto('/page-1.html');
		await page.evaluate(() => {
			window.data = {};
			window._swup.hooks.before('content:replace', async (visit) => {
				window.data.before =
					window.document.documentElement.classList.contains('is-rendering');
			});
			window._swup.hooks.on('content:replace', async (visit) => {
				window.data.after =
					window.document.documentElement.classList.contains('is-rendering');
			});
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toEqual({
			before: false,
			after: true
		});
	});
});
