import { getCurrentUrl, Location } from '../helpers';
import Swup from '../Swup';
import { PageData } from './getPageData';

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
		console.log( page.url in this.pages );
		if (page.url in this.pages === false) {
			this.pages.set(page.url, page);
		}
		page.responseURL = this.getCacheUrl(page.responseURL);
		this.last = this.pages.get(page.url) || null;
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url: string): PageRecord | null {
		url = this.getCacheUrl(url);
		return this.pages.get(url) || null;
	}

	getCurrentPage(): PageRecord | null {
		return this.getPage(this.getCacheUrl(getCurrentUrl()));
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
