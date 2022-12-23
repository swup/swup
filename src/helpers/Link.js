export default class Link {
	constructor(elementOrUrl) {
		this.link = document.createElement('a');

		if (elementOrUrl instanceof Element || elementOrUrl instanceof SVGElement) {
			this.link.href = elementOrUrl.getAttribute('href') || elementOrUrl.getAttribute('xlink:href');
		} else if (typeof elementOrUrl === 'string') {
			this.link.href = elementOrUrl;
		}
	}

	getHref() {
		return this.link.href;
	}

	getPath() {
		let path = this.link.pathname;
		if (path[0] !== '/') {
			path = '/' + path;
		}
		return path;
	}

	getAddress() {
		let path = this.link.pathname + this.link.search;

		if (this.link.getAttribute('xlink:href')) {
			path = this.link.getAttribute('xlink:href');
		}

		if (path[0] !== '/') {
			path = '/' + path;
		}
		return path;
	}

	getHash() {
		return this.link.hash;
	}
}
