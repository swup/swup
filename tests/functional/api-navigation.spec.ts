import { test } from '../support/test.js';

import { expectToBeAt } from '../support/commands.js';
import { waitForSwup } from '../support/swup.js';

test.describe('api navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
		await waitForSwup(page);
	});

	test('navigate to pages using swup api', async ({ page }) => {
		await page.evaluate(() => window._swup.navigate('/page-2.html'));
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});
});
