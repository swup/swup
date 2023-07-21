import { updateHistoryRecord, getCurrentUrl, classify } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

/**
 * Render the next page: replace the content and update scroll position.
 * @returns Promise<void>
 */
export const renderPage = async function (this: Swup, requestedUrl: string, page: PageData) {
	const { url, html } = page;

	this.classes.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), requestedUrl)) {
		return;
	}

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		updateHistoryRecord(url);
		this.currentPageUrl = getCurrentUrl();
		this.visit.to.url = this.currentPageUrl;
	}

	// only add for animated page loads
	if (this.visit.animation.animate) {
		this.classes.add('is-rendering');
	}

	// save html into visit context for easier retrieval
	this.visit.to.html = html;

	// replace content: allow handlers and plugins to overwrite paga data and containers
	await this.hooks.call('content:replace', { page }, (visit, { page }) => {
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

	await this.hooks.call(
		'content:scroll',
		{ options: { behavior: 'auto' } },
		(visit, { options }) => {
			if (visit.scroll.target) {
				const target = this.getAnchorElement(visit.scroll.target);
				if (target) {
					target.scrollIntoView(options);
					return;
				}
			}
			if (visit.scroll.reset) {
				window.scrollTo(0, 0);
			}
		}
	);

	await this.hooks.call('page:view', { url: this.currentPageUrl, title: document.title });

	// empty cache if it's disabled (in case preload plugin filled it)
	if (!this.options.cache) {
		this.cache.clear();
	}
};
