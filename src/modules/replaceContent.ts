import type Swup from '../Swup.js';
import type { Options } from '../Swup.js';
import { query, queryAll } from '../utils.js';
import type { PageData } from './fetchPage.js';

/**
 * Perform the replacement of content after loading a page.
 *
 * It takes an object with the page data as returned from `fetchPage` and a list
 * of container selectors to replace.
 *
 * @returns Whether all containers were replaced.
 */
export const replaceContent = function (
	this: Swup,
	{ html }: PageData,
	{ containers }: { containers: Options['containers'] } = this.options
): boolean {
	const incomingDocument = new DOMParser().parseFromString(html, 'text/html');

	// Update browser title
	const title = incomingDocument.querySelector('title')?.innerText || '';
	document.title = title;

	// Save persisted elements
	const persistedElements = queryAll('[data-swup-persist]:not([data-swup-persist=""])');

	// Update content containers
	const replaced = containers
		.map((selector) => {
			const currentEl = document.querySelector(selector);
			const incomingEl = incomingDocument.querySelector(selector);
			if (currentEl && incomingEl) {
				currentEl.replaceWith(incomingEl);
				return true;
			}
			if (!currentEl) {
				console.warn(`[swup] Container missing in current document: ${selector}`);
			}
			if (!incomingEl) {
				console.warn(`[swup] Container missing in incoming document: ${selector}`);
			}
			return false;
		})
		.filter(Boolean);

	// Restore persisted elements
	persistedElements.forEach((existing) => {
		const key = existing.getAttribute('data-swup-persist');
		const replacement = query(`[data-swup-persist="${key}"]`);
		if (replacement && replacement !== existing) {
			replacement.replaceWith(existing);
		}
	});

	return replaced.length === containers.length;
};
