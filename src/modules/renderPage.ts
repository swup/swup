import { updateHistoryRecord, getCurrentUrl, classify, Location } from '../helpers.js';
import type Swup from '../Swup.js';
import type { PageData } from './fetchPage.js';
import { VisitState, type Visit } from './Visit.js';

/**
 * Render the next page: replace the content and update scroll position.
 */
export const renderPage = async function (this: Swup, visit: Visit, page: PageData): Promise<void> {
	// Check if failed/aborted in the meantime
	if (visit.done) return;

	visit.advance(VisitState.ENTERING);

	const { url } = page;

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		updateHistoryRecord(url);
		this.location = Location.fromUrl(url);
		visit.to.url = this.location.url;
		visit.to.hash = this.location.hash;
	}

	// replace content: allow handlers and plugins to overwrite paga data and containers
	await this.hooks.call('content:replace', visit, { page }, (visit, { page }) => {
		this.classes.remove('is-leaving');
		// only add for animated page loads
		if (visit.animation.animate) {
			this.classes.add('is-rendering');
		}
		const success = this.replaceContent(visit);
		if (!success) {
			throw new Error('[swup] Container mismatch, aborting');
		}
		if (visit.animation.animate) {
			// Make sure to add these classes to new containers as well
			this.classes.add('is-changing', 'is-animating', 'is-rendering');
			if (visit.animation.name) {
				this.classes.add(`to-${classify(visit.animation.name)}`);
			}
		}
	});

	// scroll into view: either anchor or top of page
	await this.hooks.call('content:scroll', visit, undefined, () => {
		return this.scrollToContent(visit);
	});

	await this.hooks.call('page:view', visit, { url: this.location.url, title: document.title });
};
