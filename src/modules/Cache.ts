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

	resolve(urlToResolve: string): string {
		const { url } = Location.fromUrl(urlToResolve);
		return this.swup.resolveUrl(url);
	}

	save(url: string, page: PageData) {
		url = this.resolve(url);
		this.pages.set(url, page);
		this.last = this.get(url);
		this.swup.log(`Cache (${this.pages.size})`, this.pages);
	}

	get(url: string): PageData | undefined {
		return this.pages.get(this.resolve(url));
	}

	getCurrentPage(): PageData | undefined {
		return this.get(getCurrentUrl());
	}

	exists(url: string): boolean {
		return this.pages.has(this.resolve(url));
	}

	empty(): void {
		this.pages.clear();
		delete this.last;
		this.swup.log('Cache cleared');
	}

	remove(url: string): void {
		this.pages.delete(this.resolve(url));
	}
}
