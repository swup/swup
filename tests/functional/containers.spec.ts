import { test } from '@playwright/test';

import { expectH1, expectH2, expectPageReload, expectToBeAt } from '../support/commands.js';
import { navigateWithSwup } from '../support/swup.js';

test.describe('containers', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/containers-1.html');
	});

	test('can be customized from visit object', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => visit.containers = ['#aside']);
		});
		await navigateWithSwup(page, '/containers-2.html');
		await expectH1(page, 'Containers 1');
		await expectH2(page, 'Heading 2');
	});

	test('forces reload on container mismatch', async ({ page }) => {
		await expectPageReload(page, () => navigateWithSwup(page, '/containers-missing.html'));
		await expectToBeAt(page, '/containers-missing.html');
	});
});
