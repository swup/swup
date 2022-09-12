import { getCurrentUrl, normalizeUrl } from '../helpers.js';

export class Cache {
	constructor() {
		this.pages = {};
		this.last = null;
	}

	getCacheUrl(url) {
		return this.swup.resolvePath(normalizeUrl(url));
	}

	cacheUrl(page) {
		page.url = this.getCacheUrl(page.url);
		if (page.url in this.pages === false) {
			this.pages[page.url] = page;
		}
		page.responseURL = this.getCacheUrl(page.responseURL);
		this.last = this.pages[page.url];
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url) {
		url = this.getCacheUrl(url);
		return this.pages[url];
	}

	getCurrentPage() {
		return this.getPage(getCurrentUrl());
	}

	exists(url) {
		url = this.getCacheUrl(url);
		return url in this.pages;
	}

	empty() {
		this.pages = {};
		this.last = null;
		this.swup.log('Cache cleared');
	}

	remove(url) {
		delete this.pages[this.getCacheUrl(url)];
	}
}

export default Cache;
