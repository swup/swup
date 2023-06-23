import { escapeCssIdentifier as escape, query } from '../utils.js';

/**
 * Find the anchor element for a given hash.
 * @see https://html.spec.whatwg.org/#find-a-potential-indicated-element
 *
 * @param hash Hash with or without leading '#'
 * @returns The element, if found, or null.
 */
export const getAnchorElement = (hash: string): Element | null => {
	if (hash && hash.charAt(0) === '#') {
		hash = hash.substring(1);
	}

	if (!hash) {
		return null;
	}

	const decoded = decodeURIComponent(hash);
	let element =
		document.getElementById(hash) ||
		document.getElementById(decoded) ||
		query(`a[name='${escape(hash)}']`) ||
		query(`a[name='${escape(decoded)}']`);

	if (!element && hash === 'top') {
		element = document.body;
	}

	return element;
};
