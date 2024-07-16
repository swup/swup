import { test } from '@playwright/test';

import { expectSwupAnimationDuration } from '../support/swup.js';

test.describe('animation timing', () => {
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
});
