import { getCurrentUrl, Location } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

export class Cache {
	swup: Swup;
	pages: Record<string, PageData> = {};
	last?: PageData;

	constructor(swup: Swup) {
		this.swup = swup;
	}

	getCacheUrl(url: string): string {
		return this.swup.resolveUrl(Location.fromUrl(url).url);
	}

	cacheUrl(page: PageData) {
		page.url = this.getCacheUrl(page.url);
		if (page.url in this.pages === false) {
			this.pages[page.url] = page;
		}
		this.last = this.pages[page.url];
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url: string): PageData {
		url = this.getCacheUrl(url);
		return this.pages[url];
	}

	getCurrentPage(): PageData {
		return this.getPage(getCurrentUrl());
	}

	exists(url: string): boolean {
		url = this.getCacheUrl(url);
		return url in this.pages;
	}

	empty(): void {
		this.pages = {};
		delete this.last;
		this.swup.log('Cache cleared');
	}

	remove(url: string): void {
		url = this.getCacheUrl(url);
		delete this.pages[url];
	}
}
