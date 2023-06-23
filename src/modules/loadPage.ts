import { createHistoryRecord, updateHistoryRecord, getCurrentUrl, Location } from '../helpers.js';
import Swup from '../Swup.js';

export type HistoryAction = 'push' | 'replace';

export type PageLoadOptions = {
	transition?: string;
	history?: HistoryAction;
	animate?: boolean;
};

export function loadPage(this: Swup, url: string, options: PageLoadOptions = {}) {
	// Check if the visit should be ignored
	if (this.shouldIgnoreVisit(url)) {
		window.location.href = url;
	} else {
		const { url: to, hash } = Location.fromUrl(url);
		this.context = this.createContext({ to, hash });
		this.performPageLoad(to, options);
	}
}

export async function performPageLoad(this: Swup, url: string, options: PageLoadOptions = {}) {
	const { transition, animate, history: historyAction = 'push' } = options;

	if (animate === false) {
		this.context.animate = false;
	}

	if (!this.context.animate) {
		document.documentElement.classList.remove('is-animating');
		this.cleanupAnimationClasses();
	} else if (transition) {
		this.context.transition = transition;
	}

	await this.hooks.trigger('transitionStart');

	const animationPromise = this.leavePage();

	const fetchPromise = this.fetchPage(url, options);

	// create history record if this is not a popstate call (with or without anchor)
	if (!this.context.history.popstate) {
		const historyUrl = url + (this.context.scroll.target || '');
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
