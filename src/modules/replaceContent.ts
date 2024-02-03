import type Swup from '../Swup.js';
import { query, queryAll } from '../utils.js';
import type { Visit } from './Visit.js';

/**
 * Perform the replacement of content after loading a page.
 *
 * @returns Whether all containers were replaced.
 */
export const replaceContent = function (this: Swup, visit: Visit): boolean {
	const incomingDocument = visit.to.document;
	if (!incomingDocument) return false;

	// Update browser title
	const title = incomingDocument.querySelector('title')?.innerText || '';
	document.title = title;

	// Save persisted elements
	const persistedElements = queryAll('[data-swup-persist]:not([data-swup-persist=""])');

	// Update content containers
	const replaced = visit.containers
		.map((selector) => {
			const currentEl = document.querySelector(selector);
			const incomingEl = incomingDocument.querySelector(selector);
			if (currentEl && incomingEl) {
				currentEl.replaceWith(incomingEl.cloneNode(true));
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

	// Return true if all containers were replaced
	return replaced.length === visit.containers.length;
};
