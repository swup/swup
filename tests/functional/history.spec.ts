import { test, expect } from '@playwright/test';

import { expectPageReload, expectToBeAt, sleep } from '../support/commands.js';
import { navigateWithSwup, pushSwupHistoryState } from '../support/swup.js';
import { HistoryState } from '../../src/helpers/history.js';

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
		await expectToBeAt(page, '/history.html', 'History');
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
		await expectToBeAt(page, '/history.html', 'History');
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

	test('saves state into history', async ({ page }) => {
		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');
		await page.goBack();
		const state = await page.evaluate(() => window.history.state);
		expect(state).toMatchObject({ source: 'swup', url: '/history.html' });
	});

	test('saves scroll position into history', async ({ page }) => {
		let state: HistoryState;

		await page.evaluate(() => window.scrollTo(0, 200));

		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');

		await page.evaluate(() => window.scrollTo(0, 100));
		await page.goBack();

		state = await page.evaluate(() => window.history.state);
		expect(state).toMatchObject({ scroll: { window: { x: 0, y: 200 }} });

		await page.goForward();

		state = await page.evaluate(() => window.history.state);
		expect(state).toMatchObject({ scroll: { window: { x: 0, y: 100 }} });
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
		await pushSwupHistoryState(page, '/page-2.html', { source: 'not-swup' });
		await pushSwupHistoryState(page, '/page-3.html', { source: 'not-swup' });
		await page.goBack();
		await expectToBeAt(page, '/page-2.html', 'History');
	});

	test('replaces current history entry on error', async ({ page }) => {
		await page.route('/error-500.html', route => route.fulfill({
			status: 500,
			headers: { 'Content-Type': 'text/html' },
			body: '<!DOCTYPE html><head><title>Error</title></head><body><h1>Error</h1></body></html>'
		}));

		await navigateWithSwup(page, '/page-2.html');
		await expectToBeAt(page, '/page-2.html', 'Page 2');

		await page.goBack();
		await expectToBeAt(page, '/history.html', 'History');

		await page.goForward();
		await expectToBeAt(page, '/page-2.html', 'Page 2');

		await expectPageReload(page, () => navigateWithSwup(page, '/error-500.html'));
		await expectToBeAt(page, '/error-500.html', 'Error');

		await page.goBack();
		await expectToBeAt(page, '/page-2.html', 'Page 2');
	});
});
