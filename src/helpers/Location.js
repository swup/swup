/**
 * A helper for creating a Location from either an element
 * or a URL object/string
 */
export default class Location extends URL {
	/**
	 * Instantiate a Location from an element's href attribute
	 * @param {Element} el
	 * @return new Location instance
	 */
	static fromElement(el) {
		const href = el.getAttribute('href') || el.getAttribute('xlink:href');
		return new Location(href, document.baseURI);
	}

	/**
	 * Instantiate a Location from a URL object or string
	 * @param {URL|string} url
	 * @return new Location instance
	 */
	static fromUrl(url) {
		return new Location(url.toString(), document.baseURI);
	}

	/**
	 * Get the URL that is being used throughout swup
	 * for identifying pages: pathname + searchParams
	 * @return string
	 */
	get url() {
		return this.pathname + this.search;
	}
}
