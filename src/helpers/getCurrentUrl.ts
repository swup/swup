import { Location } from './Location.js';

export const getCurrentUrl = ({ hash }: { hash?: boolean } = {}): string => {
	const { pathname, search } = window.location;
	return Location.fromUrl(pathname + search).url + (hash ? window.location.hash : '');
};
