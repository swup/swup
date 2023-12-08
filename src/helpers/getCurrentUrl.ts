/** Get the current page URL: path name + query params. Optionally including hash. */
export const getCurrentUrl = ({ hash }: { hash?: boolean } = {}): string => {
	return window.location.pathname + window.location.search + (hash ? window.location.hash : '');
};
