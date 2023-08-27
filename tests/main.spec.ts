import { test, expect } from '@playwright/test';

import Swup from '../src/Swup.js';
// const swup = new Swup();

import {
	clickOnLink,
	expectRequestHeaders,
	expectToBeAt,
	expectToHaveCacheEntry,
	expectFullPageReload,
	navigateWithSwup,
	expectTransitionDuration,
	sleep,
	expectToHaveCacheEntries
} from './support/commands.js';

declare global {
	interface Window {
		_swup: Swup;
		_beforeReload?: boolean;
		data: any;
	}
}

test.describe('request', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('sends the correct referer', async ({ page, baseURL }) => {
		const referer = `${baseURL}/page-1.html`;
		const [request] = await Promise.all([
			page.waitForRequest('/page-2.html'),
			clickOnLink(page, '/page-2.html')
		]);
		expectRequestHeaders(request, { referer });
	});

	test('sends the correct request headers', async ({ page }) => {
		const headers = await page.evaluate(() => window._swup.options.requestHeaders);
		const [request] = await Promise.all([
			page.waitForRequest('/page-2.html'),
			clickOnLink(page, '/page-2.html')
		]);
		expectRequestHeaders(request, headers);
	});

	test('forces reload on server error', async ({ page }) => {
		await page.route('/error-500.html', route => route.fulfill({ status: 500 }));
		await expectFullPageReload(page, () => navigateWithSwup(page, '/error-500.html'));
		await expectToBeAt(page, '/error-500.html');
	});

	test('forces reload on network error', async ({ page }) => {
		await page.route('/error-network.html', route => route.abort(), { times: 1 });
		await expectFullPageReload(page, () => navigateWithSwup(page, '/error-network.html'));
		await expectToBeAt(page, '/error-network.html');
	});
});

test.describe('page load', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('allows calling original page:load handler', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.replace('page:load', (visit, args, defaultHandler) => defaultHandler!(visit, args));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('accepts a page object from page:load', async ({ page }) => {
		await page.evaluate(() => {
			const page = { url: '/page-3.html', html: '<html><head><title>Page 3</title></head><body><div id="swup"><h1>Page 3</h1></div></body></html>' };
			window._swup.hooks.replace('page:load', async () => page);
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});

	test('accepts a fetch request from page:load', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.replace('page:load', () => window._swup.fetchPage('page-3.html'));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});
});

test.describe('cache', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('caches pages', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectToHaveCacheEntry(page, '/page-2.html');
	});

	test('caches pages from absolute URLs', async ({ page, baseURL }) => {
		await navigateWithSwup(page, `${baseURL}/page-2.html`);
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectToHaveCacheEntry(page, '/page-2.html');
	});

	test('does not cache pages for POST requests', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html', { method: 'POST' });
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await expectToHaveCacheEntries(page, []);
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
		await expectToHaveCacheEntries(page, []);

		expect(await page.evaluate(() => window.data.read)).toBe(false);
		expect(await page.evaluate(() => window.data.write)).toBe(false);
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
		await navigateWithSwup(page, '/page-2.html', { cache: false });
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data.read['/page-2.html'])).toBe(false);
		expect(await page.evaluate(() => window.data.write['/page-2.html'])).toBe(false);

		// Check disabling writes
		await navigateWithSwup(page, '/page-1.html', { cache: { write: false } });
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data.write['/page-1.html'])).toBe(false);

		// Clear cache
		await page.evaluate(() => window._swup.cache.clear());

		// Check disabling reads
		await navigateWithSwup(page, '/page-2.html', { cache: { read: false } });
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data.read['/page-2.html'])).toBe(false);
		expect(await page.evaluate(() => window.data.write['/page-2.html'])).toBe(true);
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
			window._swup.hooks.on('visit:start', (visit) => visit.cache.write = false);
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data.write['/page-2.html'])).toBe(false);

		// Go back and forth
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');

		// Check disabling reads
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => visit.cache.read = false);
		});
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data.read['/page-1.html'])).toBe(false);
	});

	test('marks cached pages in page:load', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('page:load', (visit, { cache }) => window.data = cache);
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toBe(false);
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data)).toBe(false);
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toBe(true);
	});
});

test.describe('markup', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('should add swup class to html element', async ({ page }) => {
		await page.waitForSelector('html.swup-enabled');
	});

	test('should remove swup class from html element', async ({ page }) => {
		page.evaluate(() => window._swup.destroy());
		await page.waitForSelector('html:not(.swup-enabled)');
	});

	test('should set transition classes on html element', async ({ page }) => {
		await page.evaluate(() => {
			const el = document.documentElement;
			window.data = {};
			window._swup.hooks.on('visit:start', () => window.data.before = el?.className);
			window._swup.hooks.on('visit:end', () => window.data.after = el?.className);
			window._swup.hooks.on('animation:out:start', () => window.data.leave = el?.className);
			window._swup.hooks.on('animation:in:start', () => window.data.enter = el?.className);
		});

		await navigateWithSwup(page, '/page-2.html');
		await page.waitForFunction(() => window.data.after !== undefined);

		expect(await page.evaluate(() => window.data)).toMatchObject({
			before: 'swup-enabled',
			leave: 'swup-enabled is-changing is-leaving is-animating',
			enter: 'swup-enabled is-changing is-rendering',
			after: 'swup-enabled'
		});
	});

	test('should set transition classes on container element', async ({ page }) => {
		await page.evaluate(() => window._swup.options.animationScope = 'containers');
		await page.evaluate(() => {
			const el = () => document.querySelector('#swup');
			window.data = {};
			window._swup.hooks.on('visit:start', () => window.data.before = el()?.className);
			window._swup.hooks.on('visit:end', () => window.data.after = el()?.className);
			window._swup.hooks.on('animation:out:start', () => window.data.leave = el()?.className);
			window._swup.hooks.on('animation:in:start', () => window.data.enter = el()?.className);
		});

		await navigateWithSwup(page, '/page-2.html');
		await page.waitForFunction(() => window.data.after !== undefined);

		expect(await page.evaluate(() => window.data)).toMatchObject({
			before: 'wrapper transition-default',
			leave: 'wrapper transition-default is-changing is-leaving is-animating',
			enter: 'wrapper transition-default is-changing is-rendering',
			after: 'wrapper transition-default'
		});
	});
});

test.describe('events', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('should trigger custom dom events', async ({ page }) => {
		let triggered = false;
		await page.exposeBinding('triggered', async (_, data) => (triggered = data));
		await page.evaluate(() => {
			document.addEventListener('swup:link:click', (event) => window.triggered(event.detail.hook));
		});
		await clickOnLink(page, '/page-2.html');
		expect(triggered).toStrictEqual('link:click');
	});

	test('should prevent the default click event', async ({ page }) => {
		let prevented = null;
		await page.exposeBinding('prevented', async (_, data) => (prevented = data));
		await page.evaluate(() => {
			document.documentElement.addEventListener('click', (event) => window.prevented(event.defaultPrevented));
		});
		await clickOnLink(page, '/page-2.html');
		expect(prevented).toStrictEqual(true);
	});
});

test.describe('transitions', () => {
	test('should detect transition timing', async ({ page }) => {
		await page.goto('/transition-duration.html');
		await expectTransitionDuration(page, 400);
	});

	test('should detect complex transition timing', async ({ page }) => {
		await page.goto('/transition-complex.html');
		await expectTransitionDuration(page, 600);
	});

	test('should detect keyframe timing', async ({ page }) => {
		await page.goto('/transition-keyframes.html');
		await expectTransitionDuration(page, 700);
	});
});
