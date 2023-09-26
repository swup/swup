import type Swup from '../Swup.js';
import { Location } from '../helpers.js';
import { type PageData } from './fetchPage.js';

export interface CacheData extends PageData {}

/**
 * In-memory page cache.
 */
export class Cache {
	/** Swup instance this cache belongs to */
	protected _swup: Swup;

	/** Cached pages, indexed by URL */
	protected _pages: Map<string, CacheData> = new Map();

	constructor(swup: Swup) {
		this._swup = swup;
	}

	/** Number of cached pages in memory. */
	get size(): number {
		return this._pages.size;
	}

	/** All cached pages. */
	get all() {
		const copy = new Map();
		this._pages.forEach((page, key) => {
			copy.set(key, { ...page });
		});
		return copy;
	}

	/** Check if the given URL has been cached. */
	has(url: string): boolean {
		return this._pages.has(this._resolve(url));
	}

	/** Return a shallow copy of the cached page object if available. */
	get(url: string): CacheData | undefined {
		const result = this._pages.get(this._resolve(url));
		if (!result) return result;
		return { ...result };
	}

	/** Create a cache record for the specified URL. */
	set(url: string, page: CacheData) {
		url = this._resolve(url);
		page = { ...page, url };
		this._pages.set(url, page);
		this._swup.hooks.callSync('cache:set', { page });
	}

	/** Update a cache record, overwriting or adding custom data. */
	update(url: string, payload: object) {
		url = this._resolve(url);
		const page = { ...this.get(url), ...payload, url } as CacheData;
		this._pages.set(url, page);
	}

	/** Delete a cache record. */
	delete(url: string): void {
		this._pages.delete(this._resolve(url));
	}

	/** Empty the cache. */
	clear(): void {
		this._pages.clear();
		this._swup.hooks.callSync('cache:clear', undefined);
	}

	/** Remove all cache entries that return true for a given predicate function.  */
	prune(predicate: (url: string, page: CacheData) => boolean): void {
		this._pages.forEach((page, url) => {
			if (predicate(url, page)) {
				this.delete(url);
			}
		});
	}

	/** Resolve URLs by making them local and letting swup resolve them. */
	protected _resolve(urlToResolve: string): string {
		const { url } = Location.fromUrl(urlToResolve);
		return this._swup.resolveUrl(url);
	}
}
