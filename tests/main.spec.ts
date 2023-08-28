import { test, expect } from '@playwright/test';

import Swup from '../src/Swup.js';
// const swup = new Swup();

import {
	clickOnLink,
	delayRequest,
	expectAnimationDuration,
	expectFullPageReload,
	expectH1,
	expectH2,
	expectRequestHeaders,
	expectScrollPosition,
	expectSwupNavigation,
	expectToBeAt,
	expectToHaveCacheEntries,
	expectToHaveCacheEntry,
	expectToHaveText,
	navigateWithSwup,
	pushHistoryState,
	scrollToPosition,
	sleep
} from './support/commands.js';

declare global {
	interface Window {
		_swup: Swup;
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
		await page.route('/error-500.html', route => route.fulfill({ status: 500, body: '<!DOCTYPE html>' }));
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
		await page.waitForSelector('html.swup-enabled');

		await page.evaluate(() => {
			const el = document.documentElement;
			window.data = {};
			window._swup.hooks.on('visit:start', () => window.data.before = el.className);
			window._swup.hooks.on('visit:end', () => window.data.after = el.className);
			window._swup.hooks.on('animation:out:start', () => window.data.leave = el.className);
			window._swup.hooks.on('animation:in:start', () => window.data.enter = el.className);
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
		await page.waitForSelector('html.swup-enabled');

		await page.evaluate(() => window._swup.options.animationScope = 'containers');
		await page.evaluate(() => {
			const el = () => document.querySelector('[data-testid="container"]');
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
		await page.evaluate(() => {
			document.addEventListener('swup:link:click', (event) => window.data = event.detail.hook);
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual('link:click');
	});

	test('prevents the default click event', async ({ page }) => {
		await page.evaluate(() => {
			document.documentElement.addEventListener('click', (event) => window.data = event.defaultPrevented);
		});
		await clickOnLink(page, '/page-2.html');
		expect(await page.evaluate(() => window.data)).toStrictEqual(true);
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
		await page.route('/redirect-2.html', (route, request) => {
			const url = request.url().replace('/redirect-2.html', '/redirect-3.html');
			const headers = { ...request.headers(), Location: url };
			route.continue({ url, headers });
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
		await expectFullPageReload(page, () => page.getByTestId('ignore-element').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores links with data-no-swup parent', async ({ page }) => {
		await expectFullPageReload(page, () =>  page.getByTestId('ignore-parent').click());
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores visits in ignoreVisit', async ({ page }) => {
		await page.evaluate(() => window._swup.options.ignoreVisit = () => true);
		await expectFullPageReload(page, () => navigateWithSwup(page, '/page-2.html'));
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('ignores links via custom ignored path', async ({ page }) => {
		await page.evaluate(() => window._swup.options.ignoreVisit = (url) => url.endsWith('#hash'));
		await expectFullPageReload(page, () => page.getByTestId('ignore-path-end').click());
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
		await page.getByTestId('update-link').click();
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

	test('navigates to previous page on popstate', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		await expectToBeAt(page, '/history.html', 'History');
	});

	test('navigates to next page on popstate', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		await expectToBeAt(page, '/history.html', 'History');
		await sleep(50);
		await page.goForward();
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});

	test('saves state into the history', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		const state = await page.evaluate(() => window.history.state);
		expect(state).toMatchObject({ source: 'swup', url: '/history.html' });
	});

	test('calculates travel direction of history visits', async ({ page }) => {
		await page.evaluate(() => {
			window.data = null;
			window._swup.hooks.on('history:popstate', (visit) => (window.data = visit.history.direction));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');

		await page.goBack();
		await expectToBeAt(page, '/history.html', 'History');
		expect(await page.evaluate(() => window.data)).toEqual('backwards');

		await page.goForward();
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toEqual('forwards');

		await navigateWithSwup(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');

		await page.evaluate(() => window.history.go(-2));
		await expectToBeAt(page, '/history.html', 'History');
		expect(await page.evaluate(() => window.data)).toEqual('backwards');
	});

	test('triggers a custom popstate event', async ({ page }) => {
		await page.evaluate(() => {
			window.data = null;
			window._swup.hooks.on('history:popstate', () => window.data = true);
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		expect(await page.evaluate(() => window.data)).toEqual(true);
	});

	test('ignores foreign popstate entries', async ({ page }) => {
		await pushHistoryState(page, '/page-2.html', { source: 'not-swup' });
		await pushHistoryState(page, '/page-3.html', { source: 'not-swup' });
		await page.goBack();
		await expectToBeAt(page, '/page-2.html', 'History');
	});
});

test.describe('api', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('navigate to pages using swup api', async ({ page }) => {
		await page.evaluate(() => window._swup.navigate('/page-2.html'));
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});
});

test.describe('visit object', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
	});

	test('has the current and next url', async ({ page }) => {
		await page.evaluate(() => {
			window.data = { from: null, to: null };
			window._swup.hooks.on('visit:start', (visit) => {
				window.data.from = visit.from.url;
				window.data.to = visit.to.url;
			});
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toMatchObject({
			from: '/page-1.html',
			to: '/page-2.html'
		});
	});

	test('passes along click trigger and event', async ({ page }) => {
		await page.evaluate(() => {
			window.data = { el: null, event: null };
			window._swup.hooks.on('visit:start', (visit) => {
				window.data.el = (visit.trigger.el instanceof HTMLAnchorElement);
				window.data.event = (visit.trigger.event instanceof MouseEvent);
			});
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toMatchObject({ el: true, event: true });
	});

	test('passes along popstate status and event', async ({ page }) => {
		await page.evaluate(() => {
			window.data = { popstate: null, event: null };
			window._swup.hooks.on('visit:start', (visit) => {
				window.data.popstate = visit.history.popstate;
				window.data.event = (visit.trigger.event instanceof PopStateEvent);
			});
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data)).toMatchObject({ popstate: true, event: true });
	});

	test('passes along custom animation', async ({ page }) => {
		const link = page.locator('a[data-swup-animation]');
		const animation = await link.getAttribute('data-swup-animation');
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => window.data = visit.animation.name);
		});
		await link.click();
		expect(await page.evaluate(() => window.data)).toEqual(animation);
	});

	test('allows disabling animations', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => visit.animation.animate = false);
		});
		expectAnimationDuration(page, 0);
	});
});

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
		await expectFullPageReload(page, () => navigateWithSwup(page, '/containers-missing.html'));
		await expectToBeAt(page, '/containers-missing.html');
	});
});

test.describe('persisting', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/persist-1.html');
		await page.waitForSelector('html.swup-enabled');
	});

	test('persists elements across page loads', async ({ page }) => {
		const identifier = String(Math.random());
		const persistedEl = page.getByTestId('persisted');
		const unpersistedEl = page.getByTestId('unpersisted');

		const state = await persistedEl.evaluate((el, id) => el.dataset.id = id, identifier);

		await navigateWithSwup(page, '/persist-2.html');

		await expectToBeAt(page, '/persist-2.html', 'Persist 2');
		await expectToHaveText(persistedEl, 'Persist 1');
		await expectToHaveText(unpersistedEl, 'Persist 2');

		const persistedState = await persistedEl.evaluate((el) => el.dataset.id);
		expect(persistedState).not.toBeFalsy();
		expect(persistedState).toBe(state);
		expect(persistedState).toBe(identifier);
	});
});

test.describe('scrolling', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/scrolling-1.html');
	});

	test('scrolls to anchor and back to top', async ({ page }) => {
		await page.getByTestId('link-to-anchor').click();
		await expect(page.getByTestId('anchor')).toBeInViewport();
		await page.getByTestId('link-to-page').click();
		expectScrollPosition(page, 0);
	});

	test('scrolls to anchor with path', async ({ page }) => {
		await page.getByTestId('link-to-self-anchor').click();
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('scrolls to top', async ({ page }) => {
		await page.getByTestId('link-to-self-anchor').click();
		await expect(page.getByTestId('anchor')).toBeInViewport();
		await page.getByTestId('link-to-top').click();
		expectScrollPosition(page, 0);
	});

	test('scrolls to id-based anchor', async ({ page }) => {
		await page.getByTestId('link-to-anchor-by-id').click();
		await expect(page.getByTestId('anchor-by-id')).toBeInViewport();
	});

	test('scrolls to name-based anchor', async ({ page }) => {
		await page.getByTestId('link-to-anchor-by-name').click();
		await expect(page.getByTestId('anchor-by-name')).toBeInViewport();
	});

	test('prefers undecoded id attributes', async ({ page }) => {
		await page.getByTestId('link-to-anchor-encoded').click();
		await expect(page.getByTestId('anchor-encoded')).toBeInViewport();
	});

	test('accepts unencoded anchor links', async ({ page }) => {
		await page.getByTestId('link-to-anchor-unencoded').click();
		await expect(page.getByTestId('anchor-unencoded')).toBeInViewport();
	});

	test('scrolls to anchor with special characters', async ({ page }) => {
		await page.getByTestId('link-to-anchor-with-colon').click();
		await expect(page.getByTestId('anchor-with-colon')).toBeInViewport();
		await page.getByTestId('link-to-anchor-with-unicode').click();
		await expect(page.getByTestId('anchor-with-unicode')).toBeInViewport();
	});

	test('scrolls to requested hash after navigation', async ({ page }) => {
		await page.getByTestId('link-to-page-anchor').click();
		expectToBeAt(page, '/scrolling-2.html#anchor', 'Scrolling 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('appends the hash if changing visit.to.hash on the fly', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.once('visit:start', (visit) => (visit.to.hash = '#anchor'));
		});
		await page.getByTestId('link-to-page').click();
		expectToBeAt(page, '/scrolling-2.html#anchor', 'Scrolling 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('does not append the hash if changing visit.scroll.target on the fly', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.once('visit:start', (visit) => (visit.scroll.target = '#anchor'));
		});
		await page.getByTestId('link-to-page').click();
		expectToBeAt(page, '/scrolling-2.html', 'Scrolling 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});
});
