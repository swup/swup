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
 *     return this.pathname + this.search;
 *   }
 * }
 *
 */

export default class Location {
	constructor(url, base = document.baseURI) {
		const location = new URL(url.toString(), base);
		Object.defineProperty(location, 'url', { get: () => location.pathname + location.search });
		return location;
	}

	/**
	 * Instantiate a Location from an element's href attribute
	 * @param {Element} el
	 * @return new Location instance
	 */
	static fromElement(el) {
		const href = el.getAttribute('href') || el.getAttribute('xlink:href');
		return new Location(href);
	}

	/**
	 * Instantiate a Location from a URL object or string
	 * @param {URL|string} url
	 * @return new Location instance
	 */
	static fromUrl(url) {
		return new Location(url);
	}
}