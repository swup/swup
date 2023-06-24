import { beforeEach, describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { Cache } from '../Cache.js';
import { Context } from '../Context.js';

const swup = new Swup();
const cache = new Cache(swup);

describe('Cache', () => {
	it('should be empty', () => {
		expect(cache.size).toBe(0);
	});

	it('should append pages', () => {
		cache.set('/page-1', { url: '/page-1', html: '' });
		expect(cache.size).toBe(1);
	});

	it('should have pages', () => {
		cache.set('/page-1', { url: '/page-1', html: '' });
		expect(cache.has('/page-1')).toBe(true);
	});

	it('should get pages', () => {
		cache.set('/page-1', { url: '/page-1', html: '' });
		expect(cache.get('/page-1')).toEqual({ url: '/page-1', html: '' });
	});

	it('should delete pages', () => {
		cache.set('/page-1', { url: '/page-1', html: '' });
		expect(cache.has('/page-1')).toBe(true);
		cache.delete('/page-1');
		expect(cache.has('/page-1')).toBe(false);
	});

	it('should clear', () => {
		cache.set('/page-1', { url: '/page-1', html: '' });
		cache.clear();
		expect(cache.size).toBe(0);
	});

	it('should overwrite identical pages', () => {
		cache.set('/page-1', { url: '/page-1', html: '' });
		expect(cache.size).toBe(1);
		cache.set('/page-1', { url: '/page-1', html: '' });
		expect(cache.size).toBe(1);
	});

	it('should not overwrite different pages', () => {
		cache.set('/page-1', { url: '/page-1', html: '' });
		expect(cache.size).toBe(1);
		cache.set('/page-2', { url: '/page-2', html: '' });
		expect(cache.size).toBe(2);
	});

	it('should trigger a hook on set', () => {
		const handler = vi.fn();
		swup.hooks.on('pageCached', handler);

		cache.set('/page-1', { url: '/page-1', html: '<div>Test</div>' });

		expect(handler).toBeCalledTimes(1);
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
