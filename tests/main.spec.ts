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
	expectAnimationDuration,
	sleep,
	expectToHaveCacheEntries,
	delayRequest,
	scrollToPosition,
	expectScrollPosition,
	expectSwupNavigation,
	pushHistoryState
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
		await navigateWithSwup(page, '/page-2.html', { cache: false });
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
			window._swup.hooks.on('visit:start', (visit) => visit.cache.write = false);
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
			window._swup.hooks.on('visit:start', (visit) => visit.cache.read = false);
		});
		await navigateWithSwup(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data.read['/page-1.html'])).toEqual(false);
	});

	test('marks cached pages in page:load', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('page:load', (visit, { cache }) => window.data = cache);
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

test.describe('markup', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('adds swup class to html element', async ({ page }) => {
		await page.waitForSelector('html.swup-enabled');
	});

	test('removes swup class from html element', async ({ page }) => {
		const el = page.waitForSelector('html:not(.swup-enabled)');
		page.evaluate(() => window._swup.destroy());
		await el;
	});

	test('sets animation classes on html element', async ({ page }) => {
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

	test('sets animation classes on container element', async ({ page }) => {
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

	test('triggers custom dom events', async ({ page }) => {
		let triggered = false;
		await page.exposeBinding('triggered', async (_, data) => (triggered = data));
		await page.evaluate(() => {
			document.addEventListener('swup:link:click', (event) => window.triggered(event.detail.hook));
		});
		await clickOnLink(page, '/page-2.html');
		expect(triggered).toStrictEqual('link:click');
	});

	test('prevents the default click event', async ({ page }) => {
		let prevented = null;
		await page.exposeBinding('prevented', async (_, data) => (prevented = data));
		await page.evaluate(() => {
			document.documentElement.addEventListener('click', (event) => window.prevented(event.defaultPrevented));
		});
		await clickOnLink(page, '/page-2.html');
		expect(prevented).toStrictEqual(true);
	});
});

test.describe('animation timing', () => {
	test('detects animation timing', async ({ page }) => {
		await page.goto('/animation-duration.html');
		await expectAnimationDuration(page, 400);
	});

	test('detects complex animation timing', async ({ page }) => {
		await page.goto('/animation-complex.html');
		await expectAnimationDuration(page, 600);
	});

	test('detects keyframe timing', async ({ page }) => {
		await page.goto('/animation-keyframes.html');
		await expectAnimationDuration(page, 700);
	});
});

test.describe('navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('navigates to other pages', async ({ page }) => {
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await clickOnLink(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});

	test('navigates if no animation selector defined', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.options.animationSelector = false;
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores visit when meta key pressed', async ({ page, context }) => {
		await clickOnLink(page, '/page-2.html', { modifiers: ['Meta'] });
		await sleep(300);
		await expectToBeAt(page, '/page-1.html', 'Page 1');
	});

	test('ignores visit if a new visit has started', async ({ page }) => {
		await delayRequest(page, '/page-2.html', 500);
		await navigateWithSwup(page, '/page-2.html');
		await page.waitForTimeout(100);
		await navigateWithSwup(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		await page.waitForTimeout(700);
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});
});

test.describe('link resolution', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/link-resolution.html');
	});

	test('skips links to different origins', async ({ page }) => {
		await expectFullPageReload(page, () => clickOnLink(page, 'https://example.net'));
	});

	test('follows relative links', async ({ page }) => {
		await page.getByTestId('nav-link-rel').click();
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('resolves document base URLs', async ({ page }) => {
		await page.goto('/nested/nested-1.html');
		await page.getByTestId('nav-link-sub').click();
		await expectToBeAt(page, '/nested/nested-2.html', 'Nested Page 2');
	});

	test('resets scroll when resolving to same page', async ({ page }) => {
		let navigated = false;
		await page.exposeBinding('navigated', () => (navigated = true));
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', () => window.navigated());
		});
		scrollToPosition(page, 200);
		await expectScrollPosition(page, 200);
		await page.getByTestId('nav-link-self').click();
		await expectScrollPosition(page, 0);
		expect(navigated).toBe(false);
	});

	test('navigates to same page if configured via linkToSelf option', async ({ page }) => {
		let navigated = false;
		await page.exposeBinding('navigated', () => (navigated = true));
		await page.evaluate(() => {
			window._swup.options.linkToSelf = 'navigate';
			window._swup.hooks.on('visit:start', () => window.navigated());
		});
		scrollToPosition(page, 200);
		await expectScrollPosition(page, 200);
		await page.getByTestId('nav-link-self').click();
		await expectScrollPosition(page, 0);
		expect(navigated).toBe(true);
	});

	test('ignores links for equal resolved urls', async ({ page }) => {
		await page.evaluate(() => (window._swup.options.resolveUrl = () => window.location.pathname));
		await clickOnLink(page, '/page-2.html');
		await sleep(100);
		await expectToBeAt(page, '/link-resolution.html', 'Link resolution');
	});

	test('ignores popstate events for equal resolved urls', async ({ page }) => {
		await page.evaluate(() => (window._swup.options.resolveUrl = () => '/page-1.html'));
		await pushHistoryState(page, '/pushed-page-1/');
		await pushHistoryState(page, '/pushed-page-2/');
		await sleep(100);
		await page.goBack();
		await expectToBeAt(page, '/pushed-page-1/', 'Link resolution');
	});
});

test.describe('redirects', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('/redirect-2.html', (route) => {
			return route.fulfill({ status: 302, headers: { location: '/redirect-3.html' } });
		});
		await page.goto('/redirect-1.html');
	});

	test('follows redirects', async ({ page }) => {
		await navigateWithSwup(page, '/redirect-2.html');
		await expectToBeAt(page, '/redirect-3.html', 'Redirect 3');
	});

	test('does not cache redirects', async ({ page }) => {
		await navigateWithSwup(page, '/redirect-2.html');
		await expectToBeAt(page, '/redirect-3.html', 'Redirect 3');
		await expectToHaveCacheEntries(page, []);
	});
});

test.describe('ignoring visits', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/ignore-visits.html');
	});

	test('ignores links with data-no-swup attr', async ({ page }) => {
		await expectFullPageReload(page, () => page.locator('[data-testid="ignore-element"]').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores links with data-no-swup parent', async ({ page }) => {
		await expectFullPageReload(page, () => page.locator('[data-testid="ignore-parent"]').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores visits in ignoreVisit', async ({ page }) => {
		await page.evaluate(() => window._swup.options.ignoreVisit = () => true);
		await expectFullPageReload(page, () => navigateWithSwup(page, '/page-2.html'));
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores links via custom ignored path', async ({ page }) => {
		await page.evaluate(() => window._swup.options.ignoreVisit = (url) => url.endsWith('#hash'));
		await expectFullPageReload(page, () => page.locator('[data-testid="ignore-path-end"]').click());
		await expectToBeAt(page, '/page-2.html#hash', 'Page 2');
	});
});

test.describe('link selector', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/link-selector.html');
	});

	test('ignores SVG links by default', async ({ page }) => {
		await expectFullPageReload(page, () => page.locator('svg a').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('follow SVG links when added to selector', async ({ page }) => {
		await page.evaluate(() => window._swup.options.linkSelector = 'a[href], svg a[*|href]');
		await expectSwupNavigation(page, () => page.locator('svg a').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});
});

test.describe('history', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/history.html');
	});

	test('creates a new history state on visit', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.history.state.url)).toEqual('/page-2.html');
	});

	test('replaces history state via data attribute', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		const state = await page.evaluate(() => window.history.state);
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.locator('[data-testid=update-link]').click();
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		await page.goBack();
		expect(await page.evaluate(() => window.history.state)).toEqual(state);
	});

	test('replaces history state via API', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		const state = await page.evaluate(() => window.history.state);
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await navigateWithSwup(page, '/page-3.html', { history: 'replace' });
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		await page.goBack();
		expect(await page.evaluate(() => window.history.state)).toEqual(state);
	});
});
