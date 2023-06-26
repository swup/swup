import Swup from '../Swup.js';
import { createHistoryRecord, updateHistoryRecord, getCurrentUrl, Location } from '../helpers.js';
import { FetchOptions } from '../modules/fetchPage.js';
import { ContextInitOptions } from './Context.js';

export type HistoryAction = 'push' | 'replace';

export type PageLoadOptions = {
	animate?: boolean;
	transition?: string;
	history?: HistoryAction;
};

export function loadPage(
	this: Swup,
	url: string,
	options: PageLoadOptions & FetchOptions = {},
	context: Omit<ContextInitOptions, 'to'> = {}
) {
	// Check if the visit should be ignored
	if (this.shouldIgnoreVisit(url)) {
		window.location.href = url;
	} else {
		const { url: to, hash } = Location.fromUrl(url);
		this.context = this.createContext({ ...context, to, hash });
		this.performPageLoad(to, options);
	}
}

export async function performPageLoad(
	this: Swup,
	url: string,
	options: PageLoadOptions & FetchOptions = {}
) {
	const { transition, animate, history: historyAction } = options;
	options.referrer = options.referrer || this.currentPageUrl;

	if (animate === false) {
		this.context.transition.animate = false;
	}

	if (historyAction) {
		this.context.history.action = historyAction;
	}

	if (!this.context.transition.animate) {
		document.documentElement.classList.remove('is-animating');
		this.cleanupAnimationClasses();
	} else if (transition) {
		this.context.transition.name = transition;
	}

	await this.hooks.trigger('transitionStart');

	const animationPromise = this.leavePage();

	// Allow hooking before this and returning a page (e.g. preload plugin)
	const fetchPromise = this.hooks.trigger(
		'fetchPage',
		{ url, options, page: null },
		async (context, { url, options, page }) => page || (await this.fetchPage(url, options))
	);

	// create history record if this is not a popstate call (with or without anchor)
	if (!this.context.history.popstate) {
		const historyUrl = url + (this.context.scroll.target || '');
		if (this.context.history.action === 'replace') {
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
