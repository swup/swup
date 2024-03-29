import { test } from '@playwright/test';

import { expectNotToHaveClass, expectToHaveClass } from '../../support/commands.js';
import { navigateWithSwup } from '../../support/swup.js';
import { prefixed } from '../../support/utils.js';

const url = prefixed('/plugins/body-class-plugin/');

test.describe('body-class plugin', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(url('page-1.html'));
	});

	test('updates the body class', async ({ page }) => {
		const body = page.locator('body');
		await expectToHaveClass(body, 'body-1');
		await expectNotToHaveClass(body, 'body-2');
		await navigateWithSwup(page, url('page-2.html'));
		await expectToHaveClass(body, 'body-2');
		await expectNotToHaveClass(body, 'body-1');
	});
});
