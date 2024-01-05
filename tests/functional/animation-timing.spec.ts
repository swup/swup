import { expect, test } from '@playwright/test';

import { expectSwupAnimationDuration } from '../support/swup.js';
import { clickOnLink, expectToBeAt, sleep } from '../support/commands.js';

test.describe('animation timing', () => {
	test.skip(({ browserName }) => browserName === 'webkit', 'WebKit measurements are off');

	test('detects animation timing', async ({ page }) => {
		await page.goto('/animation-duration.html');
		await expectSwupAnimationDuration(page, { out: 400, in: 400, total: 800 });
	});

	test('detects complex animation timing', async ({ page }) => {
		await page.goto('/animation-complex.html');
		await expectSwupAnimationDuration(page, { out: 600, in: 600, total: 1200 });
	});

	test('detects keyframe timing', async ({ page }) => {
		await page.goto('/animation-keyframes.html');
		await expectSwupAnimationDuration(page, { out: 700, in: 700, total: 1400 });
	});

	test('keeps is-leaving until right before replacing the content', async ({ page }) => {
		await page.goto('/page-1.html');
		// @see https://stackoverflow.com/a/61336937/586823
		await page.exposeFunction('sleep', sleep);
		await page.evaluate(() => {
			window.data = {};
			window._swup.hooks.before('content:replace', async (visit) => {
				await sleep(1000);
				window.data = window.document.documentElement.classList.toString();
			});
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toBe(
			'swup-enabled is-changing is-animating is-leaving'
		);
	});
});
