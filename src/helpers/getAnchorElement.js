import { escapeCssIdentifier } from '../utils';

const getAnchorElement = (hash = '') => {
	if (!hash) {
		return null;
	}

	if (hash.charAt(0) === '#') {
		hash = hash.substring(1);
	}

	hash = decodeURIComponent(hash);
	hash = escapeCssIdentifier(hash);

	return document.querySelector(`a[name='${hash}'], #${hash}`);
};

export default getAnchorElement;
