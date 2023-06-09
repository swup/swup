import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

/**
 * Perform the replacement of content after loading a page.
 *
 * This method can be replaced or augmented by plugins to allow pausing.
 *
 * It takes an object with the page data as return from `getPageData` and has to
 * return a Promise that resolves once all content has been replaced and the
 * site is ready to start animating in the new page.
 *
 */
export const replaceContent = function (
	this: Swup,
	{ html }: PageData,
	{ containers = [] }: { containers?: string[] } = this.options
): Promise<void> {
	const doc = new DOMParser().parseFromString(html, 'text/html');

	// Update browser title
	const title = doc.querySelector('title')?.innerText || '';
	document.title = title;

	// Update content containers
	containers.forEach((selector) => {
		const currentEl = window.document.querySelector(selector);
		const incomingEl = doc.querySelector(selector);
		if (!currentEl) {
			console.warn(`[swup] Container missing in current document: ${selector}`);
			return;
		}
		if (!incomingEl) {
			console.warn(`[swup] Container missing in incoming document: ${selector}`);
			return;
		}
		currentEl.replaceWith(incomingEl);
	});

	// Return a Promise to allow plugins to defer
	return Promise.resolve();
};
