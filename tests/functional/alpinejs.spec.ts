import { test } from '@playwright/test';

import { waitForSwup } from '../support/swup.js';
import { clickOnLink } from '../support/commands.js';
import { prefixed } from '../support/utils.js';

const url = prefixed('/alpinejs/');

test.describe('alpinejs compatibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(url('/page-1.html'));
		await waitForSwup(page);
	});

	test('should listen to dom events', async ({ page }) => {
		await clickOnLink(page, url('/page-2.html'));
		await page.waitForSelector('.alpine-component.click-fired');
		await page.waitForSelector('.alpine-component.any-fired');
	});
});
