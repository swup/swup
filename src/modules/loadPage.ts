import { classify, createHistoryRecord, getCurrentUrl, Location } from '../helpers.js';
import Swup from '../Swup.js';

export type TransitionOptions = {
	url: string;
	customTransition?: string;
};

export type PageLoadOptions = {
	url: string;
	event?: PopStateEvent;
	customTransition?: string;
};

export function loadPage(this: Swup, data: TransitionOptions) {
	const { url } = data;

	// Check if the visit should be ignored
	if (this.shouldIgnoreVisit(url)) {
		window.location.href = url;
	} else {
		this.performPageLoad(data);
	}
}

export async function performPageLoad(this: Swup, data: PageLoadOptions) {
	const { url, event, customTransition } = data ?? {};

	const isHistoryVisit = event instanceof PopStateEvent;
	const skipTransition = this.shouldSkipTransition({ url, event });

	await this.hooks.trigger('transitionStart', event);

	// set transition object
	this.updateTransition(getCurrentUrl(), url, customTransition);
	if (customTransition != null) {
		document.documentElement.classList.add(`to-${classify(customTransition)}`);
	}

	// start/skip animation
	const animationPromise = this.leavePage({ event, skipTransition });

	// Load page data
	const fetchPromise = this.fetchPage(data);

	// create history record if this is not a popstate call (with or without anchor)
	if (!isHistoryVisit) {
		createHistoryRecord(url + (this.scrollToElement || ''));
	}

	this.currentPageUrl = getCurrentUrl();

	// when everything is ready, render the page
	try {
		const [page] = await Promise.all([fetchPromise, animationPromise]);
		const { url: requestedUrl } = Location.fromUrl(url);
		this.renderPage(requestedUrl, page, { event, skipTransition });
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
