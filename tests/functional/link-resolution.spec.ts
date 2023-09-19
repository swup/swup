import { test, expect } from '@playwright/test';

import { clickOnLink, expectPageReload, expectScrollPosition, expectToBeAt, scrollToPosition, sleep } from '../support/commands.js';
import { pushSwupHistoryState } from '../support/swup.js';

test.describe('link resolution', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/link-resolution.html');
	});

	test('skips links to different origins', async ({ page }) => {
		await expectPageReload(page, () => clickOnLink(page, 'https://example.net'));
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
		await pushSwupHistoryState(page, '/pushed-page-1/');
		await pushSwupHistoryState(page, '/pushed-page-2/');
		await sleep(100);
		await page.goBack();
		await expectToBeAt(page, '/pushed-page-1/', 'Link resolution');
	});
});
