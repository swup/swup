/**
 * Trim slashes from a string
 * @see https://stackoverflow.com/a/68874571/586823
 */
const trimSlashes = (str: string) =>
	str
		.split('/')
		.filter((v) => v !== '')
		.join('/');

/**
 * Create a function to prefix a path
 */
export const prefixed = (prefix: string) => {
	return (path: string) => `/${trimSlashes(prefix)}/${trimSlashes(path)}`;
};
