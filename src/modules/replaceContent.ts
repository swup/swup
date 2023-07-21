import Swup, { Options } from '../Swup.js';
import { PageData } from './fetchPage.js';

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

	return replaced.length === containers.length;
};
