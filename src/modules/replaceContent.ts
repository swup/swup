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
	const doc = new DOMParser().parseFromString(html, 'text/html');

	// Update browser title
	const title = doc.querySelector('title')?.innerText || '';
	document.title = title;

	// Update content containers
	const replaced = containers.map((selector) => {
		const currentEl = document.querySelector(selector);
		const incomingEl = doc.querySelector(selector);
		if (!currentEl) {
			console.warn(`[swup] Container missing in current document: ${selector}`);
		} else if (!incomingEl) {
			console.warn(`[swup] Container missing in incoming document: ${selector}`);
		} else {
			currentEl.replaceWith(incomingEl);
			return incomingEl;
		}
	});

	return replaced.filter(Boolean).length === containers.length;
};
