import { escapeCssIdentifier, query } from '../utils.js';

export const getAnchorElement = (hash: string): Element | null => {
	if (!hash) {
		return null;
	}

	if (hash.charAt(0) === '#') {
		hash = hash.substring(1);
	}

	hash = decodeURIComponent(hash);
	hash = escapeCssIdentifier(hash);

	// https://html.spec.whatwg.org/#find-a-potential-indicated-element
	return query(`#${hash}`) || query(`a[name='${hash}']`);
};
