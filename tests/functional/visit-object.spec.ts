import { test, expect } from '@playwright/test';

import { clickOnLink, expectToBeAt, sleep } from '../support/commands.js';
import { expectSwupAnimationDuration, navigateWithSwup } from '../support/swup.js';

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

	test('has the next page html', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.before('content:replace', (visit) => {
				window.data = visit.to.html;
			});
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.waitForSelector('html:not(.is-changing)');
		expect(await page.evaluate(() => window.data)).toMatch(/<h1>Page 2/i);
	});

	test('has the next page document', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.before('content:replace', (visit) => (window.data = visit.to.document));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.waitForSelector('html:not(.is-changing)');
		expect(await page.evaluate(() => window.data && window.data instanceof Document)).toBe(true);
	});

	test('removes the next page document when finished', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => (window.data = visit));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.waitForSelector('html:not(.is-changing)');
		await sleep(20);
		expect(await page.evaluate(() => window.data.to.document === undefined)).toBe(true);
	});

	test('removes the next page document when aborted', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.once('visit:start', (visit) => (window.data = visit));
			window._swup.hooks.once('visit:start', () => window._swup.navigate('/page-3.html'));
		});
		await navigateWithSwup(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		await page.waitForSelector('html:not(.is-changing)');
		await sleep(20);
		expect(await page.evaluate(() => window.data.to.document === undefined)).toBe(true);
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
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => window.data = visit.animation.name);
		});
		await link.click();
		expect(await page.evaluate(() => window.data)).toEqual('link');
	});

	test('passes along custom animation from parent', async ({ page }) => {
		const link = page.locator('ul[data-swup-animation] li:first-child a');
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => window.data = visit.animation.name);
		});
		await link.click();
		expect(await page.evaluate(() => window.data)).toEqual('list');
	});

	test('allows disabling animations', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => visit.animation.animate = false);
		});
		await expectSwupAnimationDuration(page, { out: 0, in: 0 });
	});

	test('allowings waiting for next page before animating', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => {
				visit.animation.wait = true;
			});
			window._swup.hooks.before('visit:transition', (visit) => {
				window.data = visit.to.html;
			});
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toMatch(/<h1>Page 2/i);
	});

	test('marks native animations', async ({ page }) => {
		const supported = await page.evaluate(() => !!document.startViewTransition);

		// `visit.animation.native` should always be false when `native` option is false
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => (window.data = visit.animation.native));
		});
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toBe(false);

		// `visit.animation.native` should be true if `native` option is true and browser supports it
		await page.goto('/animation-native.html');
		await page.evaluate(() => {
			window._swup.hooks.on('visit:start', (visit) => (window.data = visit.animation.native));
		});
		await navigateWithSwup(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		expect(await page.evaluate(() => window.data)).toBe(supported);
	});

	test('passes along custom metadata from api', async ({ page }) => {
		await page.evaluate(() => {
			window.data = null;
			window._swup.hooks.on('visit:start', (visit) => (window.data = visit.meta));
		});

		navigateWithSwup(page, '/page-2.html', { meta: { lorem: 'ipsum' } });
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toMatchObject({ lorem: 'ipsum' });
	});

	test('passes along custom metadata from link', async ({ page }) => {
		await page.goto('/metadata.html');

		await page.evaluate(() => {
			window.data = null;
			window._swup.hooks.on('visit:start', (visit) => (window.data = visit.meta));
		});
		await clickOnLink(page, '/page-1.html');
		await expectToBeAt(page, '/page-1.html', 'Page 1');
		expect(await page.evaluate(() => window.data)).toMatchObject({ dolor: 'sit amet' });
	});

	test('passes along string metadata from link', async ({ page }) => {
		await page.goto('/metadata.html');

		await page.evaluate(() => {
			window.data = null;
			window._swup.hooks.on('visit:start', (visit) => (window.data = visit.meta));
		});
		await clickOnLink(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		expect(await page.evaluate(() => window.data)).toMatchObject({ value: 'just-a-string' });
	});

	test('passes along invalid metadata from link', async ({ page }) => {
		await page.goto('/metadata.html');

		await page.evaluate(() => {
			window.data = null;
			window._swup.hooks.on('visit:start', (visit) => (window.data = visit.meta));
		});
		await clickOnLink(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		expect(await page.evaluate(() => window.data)).toMatchObject({ value: '{ "dolor: "sit amet) }' });
	});
});
