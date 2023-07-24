import { beforeEach, describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { Cache } from '../Cache.js';
import type { PageData } from '../fetchPage.js';
import { Visit } from '../Visit.js';

interface PageTtlData {
	ttl: number;
	created: number;
}

interface PageIndexData {
	index: number;
}

interface AugmentedPageData extends PageData, PageTtlData, PageIndexData {}

const swup = new Swup();
const visit = swup.visit;
const cache = new Cache(swup);

const page1 = { url: '/page-1', html: '1' };
const page2 = { url: '/page-2', html: '2' };
const page3 = { url: '/page-3', html: '3' };

describe('Cache', () => {
	beforeEach(() => {
		cache.clear();
	});

	it('should be empty', () => {
		expect(cache.size).toBe(0);
	});

	it('should append pages', () => {
		cache.set(page1.url, page1);
		expect(cache.size).toBe(1);
	});

	it('should have pages', () => {
		cache.set(page1.url, page1);
		expect(cache.has(page1.url)).toBe(true);
	});

	it('should get pages', () => {
		cache.set(page1.url, page1);
		expect(cache.get(page1.url)).toEqual(page1);
	});

	it('should delete pages', () => {
		cache.set(page1.url, page1);
		expect(cache.has(page1.url)).toBe(true);
		cache.delete(page1.url);
		expect(cache.has(page1.url)).toBe(false);
	});

	it('should clear', () => {
		cache.set(page1.url, page1);
		expect(cache.size).toBe(1);
		cache.clear();
		expect(cache.size).toBe(0);
	});

	it('should overwrite identical pages', () => {
		cache.set(page1.url, page1);
		expect(cache.size).toBe(1);
		cache.set(page1.url, page1);
		expect(cache.size).toBe(1);
	});

	it('should not overwrite different pages', () => {
		cache.set(page1.url, page1);
		expect(cache.size).toBe(1);
		cache.set(page2.url, page2);
		expect(cache.size).toBe(2);
	});

	it('should trigger a hook on set', () => {
		const handler = vi.fn();

		swup.hooks.on('cache:set', handler);

		cache.set(page1.url, page1);

		expect(handler).toBeCalledTimes(1);
		expect(handler).toBeCalledWith(visit, { page: page1 }, undefined);
	});

	it('should allow augmenting cache entries on save', () => {
		const now = Date.now();

		swup.hooks.on('cache:set', (_, { page }) => {
			const ttl: PageTtlData = { ttl: 1000, created: now };
			cache.update(page.url, ttl as AugmentedPageData);
		});

		cache.set('/page', { url: '/page', html: '' });

		const page = cache.get('/page') as AugmentedPageData;

		expect(page).toEqual({ url: '/page', html: '', ttl: 1000, created: now });
	});

	it('should allow manual pruning', () => {
		swup.hooks.on('cache:set', (_, { page }) => {
			cache.update(page.url, { index: cache.size } as AugmentedPageData);
		});

		cache.set(page1.url, page1);
		cache.set(page2.url, page2);
		cache.set(page3.url, page3);

		cache.prune((url, page) => (page as AugmentedPageData).index > 2);

		expect(cache.size).toBe(2);
		expect(cache.has(page1.url)).toBe(true);
		expect(cache.has(page2.url)).toBe(true);
		expect(cache.has(page3.url)).toBe(false);
	});
});

describe('Types', () => {
	it('error when necessary', async () => {
		const swup = new Swup();
		const cache = new Cache(swup);

		// @ts-expect-no-error
		swup.hooks.on('history:popstate', (visit: Visit, { event: PopStateEvent }) => {});
		// @ts-expect-no-error
		await swup.hooks.call('history:popstate', { event: new PopStateEvent('') });

		try {
			// @ts-expect-error
			cache.set();
			// @ts-expect-error
			cache.set(url);
			// @ts-expect-error
			cache.set(url, {});
			// @ts-expect-error
			cache.set({ url: '/test' });
		} catch (error) {}
	});
});
