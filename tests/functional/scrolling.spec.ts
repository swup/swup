import { test, expect } from '@playwright/test';

import { expectScrollPosition, expectToBeAt, scrollToPosition } from '../support/commands.js';
import { navigateWithSwup, waitForSwup } from '../support/swup.js';

test.describe('scrolling', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/scrolling-1.html');
		await waitForSwup(page);
	});

	test('scrolls to anchor and back to top', async ({ page }) => {
		await page.getByTestId('link-to-anchor').click();
		await expect(page.getByTestId('anchor')).toBeInViewport();
		await page.getByTestId('link-to-page').click();
		await expectScrollPosition(page, 0);
	});

	test('scrolls to anchor with path', async ({ page }) => {
		await page.getByTestId('link-to-self-anchor').click();
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('scrolls to top', async ({ page }) => {
		await page.getByTestId('link-to-self-anchor').click();
		await expect(page.getByTestId('anchor')).toBeInViewport();
		await page.getByTestId('link-to-top').click();
		await expectScrollPosition(page, 0);
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

	test('scrolls to top after navigation', async ({ page }) => {
		await page.getByTestId('link-to-page').click();
		await expectToBeAt(page, '/scrolling-2.html', 'Scrolling 2');
		await expectScrollPosition(page, 0);
	});

	test('scrolls to requested hash after navigation', async ({ page }) => {
		await page.getByTestId('link-to-page-anchor').click();
		await expectToBeAt(page, '/scrolling-2.html#anchor', 'Scrolling 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('restores scroll position on history visits', async ({ page }) => {
		scrollToPosition(page, 100);
		expectScrollPosition(page, 100);

		await page.getByTestId('link-to-page').click();
		await expectToBeAt(page, '/scrolling-2.html', 'Scrolling 2');
		expectScrollPosition(page, 0);

		await page.goBack();
		expectScrollPosition(page, 100);

		await page.goForward();
		expectScrollPosition(page, 0);

		scrollToPosition(page, 200);
		await page.goBack();
		expectScrollPosition(page, 100);

		await page.goForward();
		expectScrollPosition(page, 200);
	});

	test('appends the hash if changing visit.to.hash on the fly', async ({ page }) => {
		await page.evaluate(() => {
			window._swup.hooks.once('visit:start', (visit) => (visit.to.hash = '#anchor'));
		});
		await page.getByTestId('link-to-page').click();
		await expectToBeAt(page, '/scrolling-2.html#anchor', 'Scrolling 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});

	test('does not append the hash if changing visit.scroll.target on the fly', async ({
		page
	}) => {
		await page.evaluate(() => {
			window._swup.hooks.once('visit:start', (visit) => (visit.scroll.target = '#anchor'));
		});
		await page.getByTestId('link-to-page').click();
		await expectToBeAt(page, '/scrolling-2.html', 'Scrolling 2');
		await expect(page.getByTestId('anchor')).toBeInViewport();
	});
});
