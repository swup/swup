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

/**
 * Inject an import map into an HTML response.
 */
export function injectImportMap(html: string, map: Record<string, string>): string {
	if (!html.includes('<head>') || html.includes('importmap')) {
		return html;
	}

	const script = `<script type="importmap">${JSON.stringify({ imports: map })}</script>`;
	return html.replace('<head>', `<head>${script}`);
}
