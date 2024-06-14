import { test, expect } from '@playwright/test';

import { clickOnLink, delayRequest, expectToBeAt, sleep } from '../support/commands.js';
import { navigateWithSwup, waitForSwup } from '../support/swup.js';

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

	// Seems to break in CI :(
	// test('ignores visit when meta key pressed', async ({ page, context }) => {
	// 	await clickOnLink(page, '/page-2.html', { modifiers: ['Meta'] });
	// 	await sleep(300);
	// 	await expectToBeAt(page, '/page-1.html', 'Page 1');
	// });

	test('ignores visit if a new visit has started', async ({ page }) => {
		await delayRequest(page, '/page-2.html', 500);
		await navigateWithSwup(page, '/page-2.html');
		await page.waitForTimeout(100);
		await navigateWithSwup(page, '/page-3.html');
		await expectToBeAt(page, '/page-3.html', 'Page 3');
		await page.waitForTimeout(700);
		await expectToBeAt(page, '/page-3.html', 'Page 3');
	});

	test('ignores consecutive clicks on the same link', async ({ page }) => {
		await page.evaluate(() => {
			window.data = { clickCount: 0 }
			window._swup.hooks.on('link:click', () => (window.data.clickCount += 1));
		});
		await clickOnLink(page, '/page-2.html', { clickCount: 3 });
		expect(await page.evaluate(() => window.data.clickCount)).toBe(1);
	});

	test('handles rapid consecutive navigations', async ({ page }) => {
		await page.goto('/rapid-navigation/page-1.html');
		await waitForSwup(page);
		const expected = [
			'visit:start',
			'animation:out:start',
			'fetch:request',
			'page:load',
			'animation:out:await',
			'animation:out:end',
			'content:replace',
			'scroll:top',
			'content:scroll',
			'page:view',
			'animation:in:start',
			'animation:in:await',
			'animation:in:end',
			'visit:transition',
			'visit:end'
		];
		await clickOnLink(page, '/rapid-navigation/page-2.html');
		await sleep(300);
		await clickOnLink(page, '/rapid-navigation/page-2.html');

		await page.waitForSelector('html:not([aria-busy=true])');
		const received = await page.evaluate(() => window.data.received);
		expect(received).toEqual(expected);
	});

	test('ignores visits aborted before content loads', async ({ page }) => {
		await page.goto('/rapid-navigation/page-1.html');
		await waitForSwup(page);
		await page.evaluate(() => {
			window._swup.hooks.on('animation:out:start', (visit) => visit.abort());
		});
		await clickOnLink(page, '/rapid-navigation/page-2.html');
		await sleep(1000); // we have to wait here, since we cannot rely on anything from swup (the visit is being exited)
		const received = await page.evaluate(() => window.data.received);
		expect(received).toContain('visit:start');
		expect(received).not.toContain('page:load');
		expect(received).not.toContain('content:replace');
		expect(received).not.toContain('visit:end');
	});

	test('does not ignore visits after content loaded', async ({ page }) => {
		await page.goto('/rapid-navigation/page-1.html');
		await waitForSwup(page);
		await page.evaluate(() => {
			window._swup.hooks.on('content:replace', (visit) => visit.abort());
		});
		await clickOnLink(page, '/rapid-navigation/page-2.html');
		await sleep(1500); // we have to wait here, since we cannot rely on anything from swup (the visit is being exited)
		const received = await page.evaluate(() => window.data.received);
		expect(received).toContain('visit:start');
		expect(received).toContain('page:load');
		expect(received).toContain('content:replace');
		expect(received).toContain('visit:end');
	});
});
