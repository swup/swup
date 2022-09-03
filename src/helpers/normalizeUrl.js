import Link from './Link.js';

const normalizeUrl = (url) => {
	return new Link(url).getAddress();
};

export default normalizeUrl;
