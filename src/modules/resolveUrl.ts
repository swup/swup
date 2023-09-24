import type Swup from '../Swup.js';

/**
 * Utility function to validate and run the global option 'resolveUrl'
 * @param {string} url
 * @returns {string} the resolved url
 */
export function resolveUrl(this: Swup, url: string): string {
	if (typeof this.options.resolveUrl !== 'function') {
		console.warn(`[swup] options.resolveUrl expects a callback function.`);
		return url;
	}
	const result = this.options.resolveUrl(url);
	if (!result || typeof result !== 'string') {
		console.warn(`[swup] options.resolveUrl needs to return a url`);
		return url;
	}
	if (result.startsWith('//') || result.startsWith('http')) {
		console.warn(`[swup] options.resolveUrl needs to return a relative url`);
		return url;
	}
	return result;
}

/**
 * Compares the resolved version of two paths and returns true if they are the same
 * @param {string} url1
 * @param {string} url2
 * @returns {boolean}
 */
export function isSameResolvedUrl(this: Swup, url1: string, url2: string): boolean {
	return this.resolveUrl(url1) === this.resolveUrl(url2);
}
