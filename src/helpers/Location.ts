/**
 * A helper for creating a Location from either an element
 * or a URL object/string
 *
 */
export class Location extends URL {
	constructor(url: URL | string, base: string = document.baseURI) {
		super(url.toString(), base);
		// Fix Safari bug with extending native classes
		Object.setPrototypeOf(this, Location.prototype);
	}

	/**
	 * The full local path including query params.
	 */
	get url(): string {
		return this.pathname + this.search;
	}

	/**
	 * Instantiate a Location from an element's href attribute
	 * @param el
	 * @returns new Location instance
	 */
	static fromElement(el: Element): Location {
		const href = el.getAttribute('href') || el.getAttribute('xlink:href') || '';
		return new Location(href);
	}

	/**
	 * Instantiate a Location from a URL object or string
	 * @param url
	 * @returns new Location instance
	 */
	static fromUrl(url: URL | string): Location {
		return new Location(url);
	}
}
