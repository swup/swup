import { test, expect } from '@playwright/test';

import { expectScrollPosition, expectToBeAt } from '../../support/commands.js';

test.describe('scroll-plugin', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/plugins/scroll-plugin-1.html');
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
		expectToBeAt(page, '/plugins/scroll-plugin-2.html#anchor', 'Scroll Plugin 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('appends the hash if changing visit.to.hash on the fly', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.once('visit:start', (visit) => (visit.to.hash = '#anchor'));
		});
		await page.getByTestId('link-to-page').click();
		expectToBeAt(page, '/plugins/scroll-plugin-2.html#anchor', 'Scroll Plugin 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('does not append the hash if changing visit.scroll.target on the fly', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.once('visit:start', (visit) => (visit.scroll.target = '#anchor'));
		});
		await page.getByTestId('link-to-page').click();
		expectToBeAt(page, '/plugins/scroll-plugin-2.html', 'Scroll Plugin 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});
});