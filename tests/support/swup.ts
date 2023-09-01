import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import type Swup from '../../src/Swup.js';

export async function waitForSwup(page: Page) {
	await page.waitForSelector('html.swup-enabled');
}

export function navigateWithSwup(page: Page, url: string, options?: Parameters<Swup['navigate']>[1]) {
	return page.evaluate(({ url, options }) => window._swup.navigate(url, options), { url, options });
}

export async function pushSwupHistoryState(page: Page, url: string, data: Record<string, unknown> = {}) {
	const state = { url, random: Math.random(), source: 'swup', ...data };
	await page.evaluate(({ url, state }) => window.history.pushState(state, '', url), { url, state });
}

export async function expectSwupToHaveCacheEntry(page: Page, url: string) {
	const entry = await page.evaluate((url) => window._swup.cache.get(url), url);
	expect(entry).toHaveProperty('url', url);
}

export async function expectSwupToHaveCacheEntries(page: Page, urls: string[]) {
	for (const url of urls) {
		await expectSwupToHaveCacheEntry(page, url);
	}
}

export async function expectSwupAnimationDuration(page: Page, duration: number) {
	const tolerance = duration ? 0.25 : 0; // 25% plus/minus
	const expectedRange: [number, number] = [
		duration * (1 - tolerance),
		duration * (1 + tolerance)
	];
	let timing = { start: 0, end: 0, outStart: 0, outEnd: 0, inStart: 0, inEnd: 0 };

	// Make sure we're ready to animate
	await waitForSwup(page);
	// Make sure we're not disabling animations
	await page.emulateMedia({ reducedMotion: null });

	await page.evaluate(() => {
		window.data = {};
		const measure = (key: string, value?: number) => window.data[key] = value ?? performance.now();
		window._swup.hooks.before('visit:start', () => measure('start'));
		window._swup.hooks.on('visit:end', () => measure('end'));
		window._swup.hooks.before('animation:out:start', () => measure('outStart'));
		window._swup.hooks.on('animation:out:end', () => measure('outEnd'));
		window._swup.hooks.before('animation:in:start', () => measure('inStart'));
		window._swup.hooks.on('animation:in:end', () => measure('inEnd'));
		window._swup.hooks.on('animation:skip', () => measure('inStart', 0));
		window._swup.hooks.on('animation:skip', () => measure('inEnd', 0));
		window._swup.hooks.on('animation:skip', () => measure('outStart', 0));
		window._swup.hooks.on('animation:skip', () => measure('outEnd', 0));
	});

	await navigateWithSwup(page, page.url());
	await page.waitForFunction(() => window.data.end > 0);
	timing = await page.evaluate(() => window.data);

	const outDuration = timing.outEnd - timing.outStart;
	const inDuration = timing.inEnd - timing.inStart;
	expect(outDuration).toBeGreaterThanOrEqual(expectedRange[0]);
	expect(outDuration).toBeLessThanOrEqual(expectedRange[1]);
	expect(inDuration).toBeGreaterThanOrEqual(expectedRange[0]);
	expect(inDuration).toBeLessThanOrEqual(expectedRange[1]);
}
