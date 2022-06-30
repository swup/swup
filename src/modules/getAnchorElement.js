import { escapeCssIdentifier } from '../utils';

const getAnchorElement = (hash) => {
	if (!hash) {
		return null;
	}

	if (hash.charAt(0) === '#') {
		hash = hash.substring(1);
	}

	hash = decodeURIComponent(hash);
	hash = escapeCssIdentifier(hash);

	// https://html.spec.whatwg.org/#find-a-potential-indicated-element
	return document.querySelector(`#${hash}, a[name='${hash}']`);
};

export default getAnchorElement;
