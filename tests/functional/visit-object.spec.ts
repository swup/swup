import { test, expect } from '@playwright/test';

import { clickOnLink, expectToBeAt } from '../support/commands.js';
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
		await expectSwupAnimationDuration(page, { out: 0, in: 0 });
	});
});
