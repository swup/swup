import { classify, createHistoryRecord, getCurrentUrl } from '../helpers.js';
import Swup from '../index.js';
import { PageRecord } from './Cache.js';

export type TransitionOptions = {
	url: string;
	customTransition?: string;
};

const loadPage = function(this: Swup, data: TransitionOptions, popstate: PopStateEvent | null) {
	let animationPromises: Promise<void>[] = [];
	let xhrPromise: Promise<PageRecord>;

	const { url, customTransition } = data;
	const skipTransition = !!(popstate && !this.options.animateHistoryBrowsing);

	this.triggerEvent('transitionStart', popstate || undefined);

	// set transition object
	this.updateTransition(getCurrentUrl(), url, customTransition);
	if (customTransition != null) {
		document.documentElement.classList.add(`to-${classify(customTransition)}`);
	}

	// start/skip animation
	animationPromises = this.leavePage(data, { popstate, skipTransition });

	// create history record if this is not a popstate call (with or without anchor)
	if (!popstate) {
		createHistoryRecord(url + (this.scrollToElement || ''));
	}

	this.currentPageUrl = getCurrentUrl();

	// Load page data
	if (this.cache.exists(url)) {
		// Found in Cache, resolve directly
		xhrPromise = Promise.resolve(this.cache.getPage(url));
		this.triggerEvent('pageRetrievedFromCache');
	} else if (this.preloadPromise && this.preloadPromise.route === url) {
		// Alreay preloading, re-use
		xhrPromise = this.preloadPromise;
		this.preloadPromise = null;
	} else {
		xhrPromise = this.getPageFetchPromise(data);
	}

	// when everything is ready, handle the outcome
	Promise.all([xhrPromise, ...animationPromises])
		.then(([pageData]) => {
			this.renderPage(pageData, { popstate, skipTransition });
			this.preloadPromise = null;
		})
		.catch((errorUrl) => {
			// Return early if errorUrl is not defined (probably aborted preload request)
			if (errorUrl === undefined) return;

			// Rewrite `skipPopStateHandling` to redirect manually when `history.go` is processed
			this.options.skipPopStateHandling = () => {
				window.location = errorUrl;
				return true;
			};

			// Go back to the actual page we're still at
			history.go(-1);
		});
};

export default loadPage;
