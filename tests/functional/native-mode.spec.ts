import { test } from '@playwright/test';

import { expectSwupAnimationDuration, waitForSwup } from '../support/swup.js';
import { expectNotToHaveClass, expectToHaveClass } from '../support/commands.js';

test.describe('native mode', () => {
	test('adds swup-native class if supported', async ({ page }) => {
		await page.goto('/animation-native.html');
		await waitForSwup(page);
		const supported = await page.evaluate(() => !!document.startViewTransition);
		if (supported) {
			await expectToHaveClass(page.locator('html'), 'swup-native');
		} else {
			await expectNotToHaveClass(page.locator('html'), 'swup-native');
		}
	});
	test('does not add swup-native class if not enabled', async ({ page }) => {
		await page.goto('/page-1.html');
		await waitForSwup(page);
		await expectNotToHaveClass(page.locator('html'), 'swup-native');
	});
	test('awaits native view transitions', async ({ page }) => {
		await page.goto('/animation-native.html');
		const supported = await page.evaluate(() => !!document.startViewTransition);
		await expectSwupAnimationDuration(page, { total: supported ? 500 : 800 });
	});
});
