import { getCurrentUrl, Location } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './getPageData.js';

export interface PageRecord extends PageData {
	url: string;
	responseURL: string;
}
export class Cache {
	pages: Record<string, PageRecord> = {};
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
		if (page.url in this.pages === false) {
			this.pages[page.url] = page;
		}
		page.responseURL = this.getCacheUrl(page.responseURL);
		this.last = this.pages[page.url];
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url: string): PageRecord {
		url = this.getCacheUrl(url);
		return this.pages[url];
	}

	getCurrentPage(): PageRecord {
		return this.getPage(getCurrentUrl());
	}

	exists(url: string): boolean {
		url = this.getCacheUrl(url);
		return url in this.pages;
	}

	empty(): void {
		this.pages = {};
		this.last = null;
		this.swup.log('Cache cleared');
	}

	remove(url: string): void {
		delete this.pages[this.getCacheUrl(url)];
	}
}
