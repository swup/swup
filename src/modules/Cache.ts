import { getCurrentUrl, Location } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './getPageData.js';

export interface PageRecord extends PageData {
	url: string;
	responseURL: string;
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

	getPage(url: string): PageRecord | null {
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
}
