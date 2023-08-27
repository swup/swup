import { expect } from '@playwright/test';
import type { Page, Request, Locator } from '@playwright/test';

import type Swup from '../../src/Swup.js';

declare global {
	interface Window {
		_swup: Swup;
		_beforeReload?: boolean;
		measure: (key: string, val: number) => Promise<void>;
	}
}

export function sleep(timeout = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), timeout))
}

export function clickOnLink(page: Page, url: string) {
	return page.click(`a[href="${url}"]`);
}

export function navigateWithSwup(page: Page, url: string, options?: Parameters<Swup['navigate']>[1]) {
	return page.evaluate(([url, options]) => window._swup.navigate(url, options), [url, options]);
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

export async function expectFullPageReload(page: Page, action: (page: Page) => Promise<void> | void) {
	await page.evaluate(() => (window._beforeReload = true));
	const reloadPromise = page.waitForFunction(() => window._beforeReload !== true);
	await action(page);
	await reloadPromise;
}

export function expectToHaveClass(locator: Locator, className: string, not = false) {
	const regexp = new RegExp(`\\b${className}\\b`);
	return not
		? expect(locator).not.toHaveClass(regexp)
		: expect(locator).toHaveClass(regexp);
}

export function expectToHaveClasses(locator: Locator, classNames: string, not = false) {
	const classes = classNames.split(' ');
	return Promise.all(classes.map(className => expectToHaveClass(locator, className, not)));
}

export function expectNotToHaveClasses(locator: Locator, classNames: string) {
	return expectToHaveClasses(locator, classNames, true);
}

export async function expectTransitionDuration(page: Page, duration: number) {
	const url = page.url();
	const tolerance = 0.25; // 25% plus/minus
	const expectedRange: [number, number] = [
		duration * (1 - tolerance),
		duration * (1 + tolerance)
	];

	const timing = {
		start: 0,
		end: 0,
		outStart: 0,
		outEnd: 0,
		inStart: 0,
		inEnd: 0
	};

	await page.exposeBinding('measure', async (_, key, val) => (timing[key] = val));
	await page.evaluate(() => {
		window._swup.hooks.before('visit:start', () => window.measure('start', performance.now()));
		window._swup.hooks.on('visit:end', () => window.measure('end', performance.now()));
		window._swup.hooks.on('animation:out:start', () => window.measure('outStart', performance.now()));
		window._swup.hooks.on('animation:out:end', () => window.measure('outEnd', performance.now()));
		window._swup.hooks.on('animation:in:start', () => window.measure('inStart', performance.now()));
		window._swup.hooks.on('animation:in:end', () => window.measure('inEnd', performance.now()));
	});

	await navigateWithSwup(page, url);

	await expect(async () => expect(timing.inEnd - timing.inStart).toBeGreaterThan(0)).toPass();
	const outDuration = timing.outEnd - timing.outStart;
	const inDuration = timing.inEnd - timing.inStart;
	expect(outDuration).toBeGreaterThanOrEqual(expectedRange[0]);
	expect(outDuration).toBeLessThanOrEqual(expectedRange[1]);
	expect(inDuration).toBeGreaterThanOrEqual(expectedRange[0]);
	expect(inDuration).toBeLessThanOrEqual(expectedRange[1]);
}
