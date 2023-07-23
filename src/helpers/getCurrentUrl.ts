/** Get the current page URL: path name + query params. Optionally including hash. */
export const getCurrentUrl = ({ hash }: { hash?: boolean } = {}): string => {
	return location.pathname + location.search + (hash ? location.hash : '');
};
