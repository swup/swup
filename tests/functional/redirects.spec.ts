import { test } from '../support/test.js';

import { expectToBeAt } from '../support/commands.js';
import { expectSwupToHaveCacheEntries, navigateWithSwup, waitForSwup } from '../support/swup.js';

test.describe('redirects', () => {
	test.beforeEach(async ({ page }) => {
		// The redirects are handled by the server in tests/config/serve.json
		await page.goto('/redirect-1.html');
		await waitForSwup(page);
	});

	test('follows redirects', async ({ page }) => {
		await navigateWithSwup(page, '/redirect-2.html');
		await expectToBeAt(page, '/redirect-3.html', 'Redirect 3');
	});

	test('does not cache redirects', async ({ page }) => {
		await navigateWithSwup(page, '/redirect-2.html');
		await expectToBeAt(page, '/redirect-3.html', 'Redirect 3');
		await expectSwupToHaveCacheEntries(page, []);
	});
});
