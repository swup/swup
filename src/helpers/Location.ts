/**
 * A helper for creating a Location from either an element
 * or a URL object/string
 *
 */

export class Location extends URL {
	constructor(url: string, base: string = document.baseURI) {
		super(url.toString(), base);
	}

	get url() {
		return this.pathname + this.search;
	}

	/**
	 * Instantiate a Location from an element's href attribute
	 * @param {Element} el
	 * @return new Location instance
	 */
	static fromElement(el: HTMLAnchorElement): Location {
		const href = el.getAttribute('href') || el.getAttribute('xlink:href');
		return new Location(href!);
	}

	/**
	 * Instantiate a Location from a URL object or string
	 * @param {URL|string} url
	 * @return new Location instance
	 */
	static fromUrl(url: string): Location {
		return new Location(url);
	}
}
