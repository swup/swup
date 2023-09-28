import { expect, test } from '@playwright/test';

import { expectToBeAt } from '../support/commands.js';
import {
	expectSwupToHaveCacheEntries,
	expectSwupToHaveCacheEntry,
	navigateWithSwup
} from '../support/swup.js';

test.describe('cache', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('caches pages', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectSwupToHaveCacheEntry(page, '/page-2.html');
	});

	test('caches pages from absolute URLs', async ({ page, baseURL }) => {
		await navigateWithSwup(page, `${baseURL}/page-2.html`);
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectSwupToHaveCacheEntry(page, '/page-2.html');
	});

	test('does not cache pages for POST requests', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html', { method: 'POST' });
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectSwupToHaveCacheEntries(page, []);
	});

	test('disables cache from swup options', async ({ page }) => {
		await page.evaluate(() => {
			window.data = { read: null, write: null };
			window._swup.options.cache = false;
			window._swup.hooks.on('page:load', (visit, { cache }) => {
				window.data.read = cache;
				window.data.write = window._swup.cache.has(visit.to.url);
			});
		});

		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectSwupToHaveCacheEntries(page, []);

		expect(await page.evaluate(() => window.data.read)).toEqual(false);
		expect(await page.evaluate(() => window.data.write)).toEqual(false);
	});

	test('disables cache from navigation options', async ({ page }) => {
		await page.evaluate(() => {
			window.data = { read: {}, write: {} };
			window._swup.hooks.on('page:load', (visit, { cache }) => {
				window.data.read[visit.to.url] = cache;
				window.data.write[visit.to.url] = window._swup.cache.has(visit.to.url);
			});
		});

		// Check disabling completely
		await navigateWithSwup(page, '/page-2.html', { cache: { read: false, write: false } });
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data.read['/page-2.html'])).toEqual(false);
		expect(await page.evaluate(() => window.data.write['/page-2.html'])).toEqual(false);

		// Check disabling writes
		await navigateWithSwup(page, '/page-1.html', { cache: { write: false } });
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data.write['/page-1.html'])).toEqual(false);

		// Clear cache
		await page.evaluate(() => window._swup.cache.clear());

		// Check disabling reads
		await navigateWithSwup(page, '/page-2.html', { cache: { read: false } });
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data.read['/page-2.html'])).toEqual(false);
		expect(await page.evaluate(() => window.data.write['/page-2.html'])).toEqual(true);
	});

	test('disables cache from visit object', async ({ page }) => {
		await page.evaluate(() => {
			window.data = { read: {}, write: {} };
			window._swup.hooks.on('page:load', (visit, { cache }) => {
				window.data.read[visit.to.url] = cache;
				window.data.write[visit.to.url] = window._swup.cache.has(visit.to.url);
			});
		});

		// Check disabling writes
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => (visit.cache.write = false));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data.write['/page-2.html'])).toEqual(false);

		// Go back and forth
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');

		// Check disabling reads
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => (visit.cache.read = false));
		});
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data.read['/page-1.html'])).toEqual(false);
	});

	test('marks cached pages in page:load', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('page:load', (visit, { cache }) => (window.data = cache));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toEqual(false);
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data)).toEqual(false);
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toEqual(true);
	});
});
