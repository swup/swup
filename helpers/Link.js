export default class Link {
	constructor(elementOrUrl) {
		if (elementOrUrl instanceof Element || elementOrUrl instanceof SVGElement) {
			this.link = elementOrUrl;
		} else {
			this.link = document.createElement('a');
			this.link.href = elementOrUrl;
		}
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
