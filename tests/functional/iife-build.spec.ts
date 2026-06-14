import { test, expect } from '../support/test.js';

import { waitForSwup } from '../support/swup.js';

test.describe('iife-build', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/iife-global.html');
		await waitForSwup(page);
	});

	test('defines window.Swup globally', async ({ page }) => {
		expect(await page.evaluate(() => typeof window.Swup === 'function')).toBe(true);
	});

	test('can instantiate Swup from the global', async ({ page }) => {
		expect(await page.evaluate(() => window._swup instanceof window.Swup)).toBe(true);
	});

	test('swup instance is functional', async ({ page }) => {
		expect(await page.evaluate(() => typeof window._swup.version === 'string')).toBe(true);
		expect(await page.evaluate(() => typeof window._swup.cache === 'object')).toBe(true);
	});
});
