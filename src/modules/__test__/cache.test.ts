import { beforeEach, describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { Cache, CacheData } from '../Cache.js';
import { Context } from '../Context.js';

interface CacheTtlData {
	ttl: number;
	created: number;
}

interface CacheIndexData {
	index: number;
}

interface AugmentedCacheData extends CacheData, CacheTtlData, CacheIndexData {}

const swup = new Swup();
const ctx = swup.context;
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

		swup.hooks.on('pageCached', handler);

		cache.set(page1.url, page1);

		expect(handler).toBeCalledTimes(1);
		expect(handler).toBeCalledWith(ctx, { page: page1 }, undefined);
	});

	it('should allow augmenting cache entries on save', () => {
		const now = Date.now();

		swup.hooks.on('pageCached', (_, { page }) => {
			const ttl: CacheTtlData = { ttl: 1000, created: now };
			cache.update(page.url, ttl as AugmentedCacheData);
		});

		cache.set('/page', { url: '/page', html: '' });

		const page = cache.get('/page') as AugmentedCacheData;

		expect(page).toEqual({ url: '/page', html: '', ttl: 1000, created: now });
	});

	it('should allow manual pruning', () => {
		swup.hooks.on('pageCached', (_, { page }) => {
			cache.update(page.url, { index: cache.size } as AugmentedCacheData);
		});

		cache.set(page1.url, page1);
		cache.set(page2.url, page2);
		cache.set(page3.url, page3);

		cache.prune((url, page) => (page as AugmentedCacheData).index > 2);

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
		swup.hooks.on('popState', (ctx: Context, { event: PopStateEvent }) => {});
		// @ts-expect-no-error
		await swup.hooks.trigger('popState', { event: new PopStateEvent('') });

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
