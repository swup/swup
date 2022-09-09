import { getCurrentUrl, normalizeUrl } from '../helpers.js';

export class Cache {
	constructor(options) {
		this.pages = {};
		this.last = null;

		const defaults = {
			enabled: options === false ? false : true,
			resolve: (path) => path
		};
		this.options = {
			...defaults,
			...options
		};

		if (typeof this.options.resolve !== 'function') {
			throw new Error('cache.options.resolve needs to be a function.');
		}
	}

	resolvePath(url) {
		return this.options.resolve(normalizeUrl(url));
	}

	cacheUrl(page) {
		page.url = this.resolvePath(page.url);
		if (page.url in this.pages === false) {
			this.pages[page.url] = page;
		}
		this.last = this.pages[page.url];
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url) {
		url = this.resolvePath(url);
		return this.pages[url];
	}

	getCurrentPage() {
		return this.getPage(this.resolvePath(getCurrentUrl()));
	}

	exists(url) {
		url = this.resolvePath(url);
		return url in this.pages;
	}

	empty() {
		this.pages = {};
		this.last = null;
		this.swup.log('Cache cleared');
	}

	remove(url) {
		delete this.pages[this.resolvePath(url)];
	}
}

export default Cache;
