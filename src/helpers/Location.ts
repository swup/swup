/**
 * A helper for creating a Location from either an element
 * or a URL object/string
 *
 */
export class Location extends URL {
	constructor(url: string, base: string = document.baseURI) {
		super(url, base);
		this.normalize();
	}

	get url() {
		return this.pathname + this.search;
	}

	/**
	 * Normalizes the location. Invoked every time a Location is created
	 *
	 * - sort the searchParams
	 * - remove the trailing slash from the pathname
	 */
	normalize() {
		this.searchParams.sort();
		this.pathname = removeTrailingSlash(this.pathname);
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

export const removeTrailingSlash = (str: string) => {
	return str.endsWith('/') ? str.slice(0, -1) : str;
};

export const addTrailingSlash = (str: string) => {
	return removeTrailingSlash(str) + '/';
};
