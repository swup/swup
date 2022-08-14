import Link from './Link';

const normalizeUrl = (url) => {
	return new Link(url).getAddress();
};

export default normalizeUrl;
