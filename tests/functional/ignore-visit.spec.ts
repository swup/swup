import { test } from '../support/test.js';

import { expectPageReload, expectToBeAt } from '../support/commands.js';
import { navigateWithSwup, waitForSwup } from '../support/swup.js';

test.describe('ignore visit', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/ignore-visits.html');
		await waitForSwup(page);
	});

	test('ignores links with data-no-swup attr', async ({ page }) => {
		await expectPageReload(page, () => page.getByTestId('ignore-element').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores links with data-no-swup parent', async ({ page }) => {
		await expectPageReload(page, () =>  page.getByTestId('ignore-parent').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores visits in ignoreVisit', async ({ page }) => {
		await page.evaluate(() => window._swup.options.ignoreVisit = () => true);
		await expectPageReload(page, () => navigateWithSwup(page, '/page-2.html'));
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores links via custom ignored path', async ({ page }) => {
		await page.evaluate(() => window._swup.options.ignoreVisit = (url) => url.endsWith('#hash'));
		await expectPageReload(page, () => page.getByTestId('ignore-path-end').click());
		await expectToBeAt(page, '/page-2.html#hash', 'Page 2');
	});
});
