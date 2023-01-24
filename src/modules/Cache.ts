import { getCurrentUrl, Location } from '../helpers';
import Swup from '../Swup';
import { PageData } from './getPageData';

export interface PageRecord extends PageData {
	url: string;
	responseURL: string;
	timestamp: number;
}
export class Cache {
	pages: Map<string, PageRecord> = new Map();
	last: PageRecord | null = null;
	swup: Swup;

	constructor(swup: Swup) {
		this.swup = swup;
	}

	getCacheUrl(url: string): string {
		return this.swup.resolveUrl(Location.fromUrl(url).url);
	}

	cacheUrl(page: PageRecord) {
		page.url = this.getCacheUrl(page.url);
		page.responseURL = this.getCacheUrl(page.responseURL);

		if (!this.exists(page.url)) {
			this.pages.set(page.url, page);
		}

		this.last = this.getPage(page.url);

		this.swup.log(`Cache (${this.pages.size})`, this.pages);
	}

	/**
	 * Get a page from the cache.
	 * Will make sure that expired pages won't be returned.
	 */
	getPage(url: string): PageRecord | null {
		this.deleteExpiredPages();
		return this.pages.get(this.getCacheUrl(url)) || null;
	}

	getCurrentPage(): PageRecord | null {
		return this.getPage(getCurrentUrl());
	}

	exists(url: string): boolean {
		return this.pages.has(this.getCacheUrl(url));
	}

	empty(): void {
		this.pages.clear();
		this.last = null;
		this.swup.log('Cache cleared');
	}

	remove(url: string): void {
		this.pages.delete(this.getCacheUrl(url));
	}

	/**
	 * Delete all expired pages
	 */
	deleteExpiredPages(): void {
		for (const [key, page] of this.pages.entries()) {
			if (this.isExpiredPage(page)) {
				this.pages.delete(key);
			}
		}
	}

	/**
	 * Checks if a page should be considered expired.
	 * Will return true if the page was saved more then 10 minutes ago
	 */
	isExpiredPage(page: PageRecord): boolean {
		const ttl = this.getTimeToLive(page);
		if (ttl === 0) return false;
		return new Date(Date.now() - page.timestamp).getSeconds() > ttl;
	}

	/**
	 * Get the time to live for a page record.
	 * Defaults to 600 seconds (10 minutes).
	 * If this returns 0 the cache for the requested page will never expire
	 */
	getTimeToLive(page: PageRecord): number {
		return 600;
	}
}
