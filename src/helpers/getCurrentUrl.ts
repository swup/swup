export const getCurrentUrl = ({ hash }: { hash?: boolean } = {}): string => {
	return location.pathname + location.search + (hash ? location.hash : '');
};
