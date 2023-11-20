import { updateHistoryRecord, getCurrentUrl, classify } from '../helpers.js';
import type Swup from '../Swup.js';
import type { PageData } from './fetchPage.js';
import type { Visit } from './Visit.js';

/**
 * Render the next page: replace the content and update scroll position.
 */
export const renderPage = async function (this: Swup, visit: Visit, page: PageData): Promise<void> {
	const { url, html } = page;

	this.classes.remove('is-leaving');

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		updateHistoryRecord(url);
		this.currentPageUrl = getCurrentUrl();
		visit.to.url = this.currentPageUrl;
	}

	// only add for animated page loads
	if (visit.animation.animate) {
		this.classes.add('is-rendering');
	}

	// save html into visit context for easier retrieval
	visit.to.html = html;

	// replace content: allow handlers and plugins to overwrite paga data and containers
	await this.hooks.call('content:replace', visit, { page }, (visit, { page }) => {
		const success = this.replaceContent(page, { containers: visit.containers });
		if (!success) {
			throw new Error('[swup] Container mismatch, aborting');
		}
		if (visit.animation.animate) {
			// Make sure to add these classes to new containers as well
			this.classes.add('is-animating', 'is-changing', 'is-rendering');
			if (visit.animation.name) {
				this.classes.add(`to-${classify(visit.animation.name)}`);
			}
		}
	});

	// scroll into view: either anchor or top of page
	// @ts-ignore: not returning a promise is intentional to allow users to pause in handler
	await this.hooks.call('content:scroll', undefined, () => {
		return this.scrollToContent(visit);
	});

	await this.hooks.call('page:view', visit, { url: this.currentPageUrl, title: document.title });
};
