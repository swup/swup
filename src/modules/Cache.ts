import Swup from '../Swup.js';
import { Location } from '../helpers.js';
import { PageData } from './fetchPage.js';

export interface CacheData extends PageData {}

/**
 * In-memory page cache.
 */
export class Cache {
	/** Swup instance this cache belongs to */
	protected swup: Swup;

	/** Cached pages, indexed by URL */
	protected pages: Map<string, CacheData> = new Map();

	constructor(swup: Swup) {
		this.swup = swup;
	}

	/** Number of cached pages in memory. */
	get size(): number {
		return this.pages.size;
	}

	/** All cached pages. */
	get all() {
		return this.pages;
	}

	/** Check if the given URL has been cached. */
	has(url: string): boolean {
		return this.pages.has(this.resolve(url));
	}

	/** Return the cached page object if cached. */
	get(url: string): CacheData | undefined {
		return this.pages.get(this.resolve(url));
	}

	/** Create a cache record for the specified URL. */
	set(url: string, page: CacheData) {
		url = this.resolve(url);
		page = { ...page, url };
		this.pages.set(url, page);
		this.swup.hooks.callSync('cache:set', { page });
	}

	/** Update a cache record, overwriting or adding custom data. */
	update(url: string, page: CacheData) {
		url = this.resolve(url);
		page = { ...this.get(url), ...page, url };
		this.pages.set(url, page);
	}

	/** Delete a cache record. */
	delete(url: string): void {
		this.pages.delete(this.resolve(url));
	}

	/** Empty the cache. */
	clear(): void {
		this.pages.clear();
		this.swup.hooks.callSync('cache:clear');
	}

	/** Remove all cache entries that return true for a given predicate function.  */
	prune(predicate: (url: string, page: CacheData) => boolean): void {
		this.pages.forEach((page, url) => {
			if (predicate(url, page)) {
				this.delete(url);
			}
		});
	}

	/** Resolve URLs by making them local and letting swup resolve them. */
	protected resolve(urlToResolve: string): string {
		const { url } = Location.fromUrl(urlToResolve);
		return this.swup.resolveUrl(url);
	}
}
