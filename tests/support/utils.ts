/**
 * Trim slashes from a string
 * @see https://stackoverflow.com/a/3840645/586823
 */
const trimSlashes = (str: string) => str.replace(/^\/|\/$/g, '');

/**
 * Create a function to prefix a path
 */
export const prefixed = (prefix: string) => {
	return (path: string) => `/${trimSlashes(prefix)}/${trimSlashes(path)}`;
};
