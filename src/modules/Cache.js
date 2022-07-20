import { getCurrentUrl, normalizeUrl } from './../helpers';

export class Cache {
	constructor() {
		this.pages = {};
		this.last = null;
	}

	cacheUrl(page) {
		page.url = normalizeUrl(page.url);
		if (page.url in this.pages === false) {
			this.pages[page.url] = page;
		}
		this.last = this.pages[page.url];
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url) {
		url = normalizeUrl(url);
		return this.pages[url];
	}

	getCurrentPage() {
		return this.getPage(getCurrentUrl());
	}

	exists(url) {
		url = normalizeUrl(url);
		return url in this.pages;
	}

	empty() {
		this.pages = {};
		this.last = null;
		this.swup.log('Cache cleared');
	}

	remove(url) {
		delete this.pages[url];
	}
}

export default Cache;
