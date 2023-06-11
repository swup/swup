import Swup from '../Swup.js';
import { getCurrentUrl, Location } from '../helpers.js';
import { PageData } from './fetchPage.js';

export class Cache {
	swup: Swup;
	pages: Map<string, PageData> = new Map();
	last?: PageData;

	constructor(swup: Swup) {
		this.swup = swup;
	}

	getCacheUrl(urlToResolve: string): string {
		const { url } = Location.fromUrl(urlToResolve);
		return this.swup.resolveUrl(url);
	}

	cacheUrl(page: PageData) {
		page.url = this.getCacheUrl(page.url);
		this.pages.set(page.url, page);
		this.last = this.getPage(page.url);
		this.swup.log(`Cache (${this.pages.size})`, this.pages);
	}

	getPage(url: string): PageData | undefined {
		return this.pages.get(this.getCacheUrl(url));
	}

	getCurrentPage(): PageData | undefined {
		return this.getPage(getCurrentUrl());
	}

	exists(url: string): boolean {
		return this.pages.has(this.getCacheUrl(url));
	}

	empty(): void {
		this.pages.clear();
		delete this.last;
		this.swup.log('Cache cleared');
	}

	remove(url: string): void {
		this.pages.delete(this.getCacheUrl(url));
	}
}
