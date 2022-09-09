import { getCurrentUrl, normalizeUrl } from '../helpers.js';

export class Cache {
	constructor(options) {
		this.pages = {};
		this.last = null;

		const defaults = {
			resolvePath: path => path
		}
		this.options = {
			...defaults,
			...options
		};
	}

	resolveUrl(url) {
		const result = this.options.resolvePath(normalizeUrl(url));
		return result;
	}

	cacheUrl(page) {
		page.url = this.resolveUrl(page.url);
		if (page.url in this.pages === false) {
			this.pages[page.url] = page;
		}
		this.last = this.pages[page.url];
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url) {
		url = this.resolveUrl(url);
		return this.pages[url];
	}

	getCurrentPage() {
		return this.getPage(getCurrentUrl());
	}

	exists(url) {
		url = this.resolveUrl(url);
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
