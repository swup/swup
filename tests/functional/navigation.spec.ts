import { test, expect } from '@playwright/test';

import { clickOnLink, delayRequest, expectToBeAt } from '../support/commands.js';
import { navigateWithSwup } from '../support/swup.js';

test.describe('navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('navigates to other pages', async ({ page }) => {
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await clickOnLink(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});

	test('navigates if no animation selector defined', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.options.animationSelector = false;
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	// Seems to break in CI :(
	// test('ignores visit when meta key pressed', async ({ page, context }) => {
	// 	await clickOnLink(page, '/page-2.html', { modifiers: ['Meta'] });
	// 	await sleep(300);
	// 	await expectToBeAt(page, '/page-1.html', 'Page 1');
	// });

	test('ignores visit if a new visit has started', async ({ page }) => {
		await delayRequest(page, '/page-2.html', 500);
		await navigateWithSwup(page, '/page-2.html');
		await page.waitForTimeout(100);
		await navigateWithSwup(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		await page.waitForTimeout(700);
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});

	test("ignore double-clicks on links", async ({ page }) => {
		let triggerCount: number | undefined;
		await page.exposeBinding('updateTestVar', (_source, value) => (triggerCount = value));
		await page.evaluate(() => {
			let count = 0;
			window._swup.hooks.on('link:click', () => (window.updateTestVar(++count)));
		});
		await clickOnLink(page, '/page-2.html', { clickCount: 3 });
		expect(triggerCount).toBe(1);
	});
});
