import {
	classify,
	createHistoryRecord,
	updateHistoryRecord,
	getCurrentUrl,
	Location
} from '../helpers.js';
import Swup from '../Swup.js';

export type HistoryAction = 'push' | 'replace';

export type PageLoadOptions = {
	transition?: string;
	history?: HistoryAction;
};

export function loadPage(this: Swup, url: string, options: PageLoadOptions = {}) {
	// Check if the visit should be ignored
	if (this.shouldIgnoreVisit(url)) {
		window.location.href = url;
	} else {
		this.performPageLoad(url, options);
	}
}

export async function performPageLoad(this: Swup, url: string, options: PageLoadOptions = {}) {
	const { transition, history: historyAction = 'push' } = options;

	if (!this.context.animate) {
		document.documentElement.classList.remove('is-animating');
		this.cleanupAnimationClasses();
	}

	await this.hooks.trigger('transitionStart');

	// set transition object
	if (transition) {
		this.context.transition = transition;
		document.documentElement.classList.add(`to-${classify(transition)}`);
	}

	// start/skip animation
	const animationPromise = this.leavePage();

	// Load page data
	const fetchPromise = this.fetchPage(url, options);

	// create history record if this is not a popstate call (with or without anchor)
	if (!this.context.trigger.history) {
		const historyUrl = url + (this.scrollToElement || '');
		if (historyAction === 'replace') {
			updateHistoryRecord(historyUrl);
		} else {
			createHistoryRecord(historyUrl);
		}
	}

	this.currentPageUrl = getCurrentUrl();

	// when everything is ready, render the page
	try {
		const [page] = await Promise.all([fetchPromise, animationPromise]);
		const { url: requestedUrl } = Location.fromUrl(url);
		this.renderPage(requestedUrl, page);
	} catch (errorUrl: any) {
		// Return early if errorUrl is not defined (probably aborted preload request)
		if (errorUrl === undefined) return;

		// Rewrite `skipPopStateHandling` to redirect manually when `history.go` is processed
		this.options.skipPopStateHandling = () => {
			window.location = errorUrl;
			return true;
		};

		// Go back to the actual page we're still at
		history.go(-1);
	}
}
