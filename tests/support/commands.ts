import { expect } from '@playwright/test';
import type { Page, Request, Locator, BrowserContext } from '@playwright/test';

import type Swup from '../../src/Swup.js';

declare global {
	interface Window {
		_swup: Swup;
		measure: (key: string) => Promise<void>;
	}
}

export function sleep(timeout = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), timeout))
}

export function clickOnLink(page: Page, url: string, options?: Parameters<Page['click']>[1]) {
	return page.click(`a[href="${url}"]`, options);
}

export function navigateWithSwup(page: Page, url: string, options?: Parameters<Swup['navigate']>[1]) {
	return page.evaluate(({ url, options }) => window._swup.navigate(url, options), { url, options });
}

export async function expectToBeAt(page: Page, url: string, title?: string) {
	await expect(page).toHaveURL(url);
	if (title) {
		await expectTitle(page, title);
		await expectH1(page, title);
	}
}

export async function expectTitle(page: Page, title: string) {
	await expect(page).toHaveTitle(title);
}

export async function expectH1(page: Page, title: string) {
	await expect(page.locator('h1')).toContainText(title);
}

export async function expectH2(page: Page, title: string) {
	await expect(page.locator('h2')).toContainText(title);
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

export async function expectFullPageReload(page: Page, action: (page: Page) => Promise<void> | void, not: boolean = false) {
	let fetchedInBackground: boolean;
	page.on('request', (request) => fetchedInBackground = ['xhr', 'fetch'].includes(request.resourceType()));
	await action(page);
	await page.waitForLoadState('load');
	expect(async () => expect(fetchedInBackground).toBe(not ? true : false)).toPass();
}

export function expectSwupNavigation(page: Page, action: (page: Page) => Promise<void> | void) {
	return expectFullPageReload(page, action, true);
}

export function expectToHaveText(locator: Locator, text: string) {
	return expect(locator).toContainText(text);
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

export async function expectAnimationDuration(page: Page, duration: number) {
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
		inEnd: 0,
	};

	await page.exposeBinding('measure', async (_, key) => timing[key] = performance.now());
	await page.evaluate(() => {
		window._swup.hooks.on('visit:start', () => window.measure('start'));
		window._swup.hooks.on('visit:end', () => window.measure('end'));
		window._swup.hooks.on('animation:out:start', () => window.measure('outStart'));
		window._swup.hooks.on('animation:out:start', () => document.body.offsetWidth);
		window._swup.hooks.on('animation:out:end', () => window.measure('outEnd'));
		window._swup.hooks.on('animation:in:start', () => window.measure('inStart'));
		window._swup.hooks.on('animation:in:end', () => window.measure('inEnd'));
	});

	await navigateWithSwup(page, page.url());
	await expect(async () => expect(timing.end).toBeGreaterThan(0)).toPass();
	await sleep(100);

	const outDuration = timing.outEnd - timing.outStart;
	expect(outDuration).toBeGreaterThanOrEqual(expectedRange[0]);
	expect(outDuration).toBeLessThanOrEqual(expectedRange[1]);
	const inDuration = timing.inEnd - timing.inStart;
	expect(inDuration).toBeGreaterThanOrEqual(expectedRange[0]);
	expect(inDuration).toBeLessThanOrEqual(expectedRange[1]);
}

export async function delayRequest(page: Page, url: string, timeout: number) {
	await page.route(url, async (route) => {
		await sleep(timeout);
		route.continue();
	})
}

export function scrollToPosition(page: Page,y: number) {
	return page.evaluate((y) => window.scrollTo(0, y), y);
}

export async function expectScrollPosition(page: Page, y: number) {
	await expect(
		async () => expect(
			await page.evaluate(() => window.scrollY)
		).toEqual(y)
	).toPass();
}

export async function pushHistoryState(page: Page, url: string, data: Record<string, unknown> = {}) {
	const state = { url, random: Math.random(), source: 'swup', ...data };
	await page.evaluate(({ url, state }) => window.history.pushState(state, '', url), { url, state });
}
