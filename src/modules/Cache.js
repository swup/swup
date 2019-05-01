export class Cache {
	constructor() {
		this.pages = {};
		this.count = 0;
		this.last = null;
	}

	cacheUrl(page) {
		this.count++;
		if (page.url in this.pages === false) {
			this.pages[page.url] = page;
		}
		this.last = this.pages[page.url];
		this.swup.log(`Cache (${Object.keys(this.pages).length})`, this.pages);
	}

	getPage(url) {
		return this.pages[url];
	}

	getCurrentPage() {
		return this.getPage(window.location.pathname + window.location.search);
	}

	exists(url) {
		return url in this.pages;
	}

	empty() {
		this.pages = {};
		this.count = 0;
		this.last = null;
		this.swup.log('Cache cleared');
	}

	remove(url) {
		delete this.pages[url];
	}
}

export default Cache;
