import { expect } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

import type Swup from '../../src/Swup.js';

declare global {
	interface Window {
		_swup: Swup;
		_beforeReload?: boolean;
	}
}

export function clickOnLink(page: Page, url: string) {
	return page.click(`a[href="${url}"]`);
}

export function loadWithSwup(page: Page, url: string) {
	return page.evaluate((url) => window._swup.loadPage(url), url);
}

export async function expectToBeAt(page: Page, url: string, title?: string) {
	await expect(page).toHaveURL(url);
	if (title) {
		await expect(page).toHaveTitle(title);
		await expect(page.locator('h1')).toContainText(title);
	}
}

export async function expectRequestHeaders(request: Request, headers: Record<string, string>) {
	const expected = Object.fromEntries(
		Object.entries(headers).map(([header, value]) => [header.toLowerCase(), value])
	);
	expect(request.headers()).toMatchObject(expected);
}

export async function expectToHaveCacheEntry(page: Page, url: string) {
	const entry = await page.evaluate((url) => window._swup.cache.get(url), url);
	expect(entry).toHaveProperty('url', url);
}

export async function expectToHaveCacheEntries(page: Page, urls: string[]) {
	for (const url of urls) {
		await expectToHaveCacheEntry(page, url);
	}
}

export async function expectToHaveReloadedAfterAction(page: Page, action: (page: Page) => void) {
	await page.evaluate(() => (window._beforeReload = true));
	const reloadPromise = page.waitForFunction(() => window._beforeReload !== true);
	await action(page);
	await reloadPromise;
}
