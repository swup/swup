/**
 * A helper for creating a Location from either an element
 * or a URL object/string
 *
 * Note: this could be implemented as a class inheriting from URL
 * Except: Babel will add tons of boilerplate for ES6 classes + getters
 * So for now it's implemented as an augmented URL object with custom getter
 *
 * class Location extends URL {
 *   get url() {
 *	 return this.pathname + this.search;
 *   }
 * }
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
