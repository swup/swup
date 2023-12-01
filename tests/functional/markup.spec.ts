import { test, expect } from '@playwright/test';

import { navigateWithSwup, waitForSwup } from '../support/swup.js';

test.describe('markup', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/page-1.html');
		await waitForSwup(page);
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
			leave: 'swup-enabled is-changing is-animating is-leaving',
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
			leave: 'wrapper transition-default is-changing is-animating is-leaving',
			enter: 'wrapper transition-default is-changing is-rendering',
			after: 'wrapper transition-default'
		});
	});
});
