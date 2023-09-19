import { test } from '@playwright/test';

import { expectSwupAnimationDuration } from '../support/swup.js';

test.describe('animation timing', () => {
	test.skip(({ browserName }) => browserName == 'webkit', 'WebKit measurements are off');

	test('detects animation timing', async ({ page }) => {
		await page.goto('/animation-duration.html');
		await expectSwupAnimationDuration(page, 400);
	});

	test('detects complex animation timing', async ({ page }) => {
		await page.goto('/animation-complex.html');
		await expectSwupAnimationDuration(page, 600);
	});

	test('detects keyframe timing', async ({ page }) => {
		await page.goto('/animation-keyframes.html');
		await expectSwupAnimationDuration(page, 700);
	});
});
