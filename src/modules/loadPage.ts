import { classify, createHistoryRecord, fetch, getCurrentUrl } from '../helpers.js';
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
		// Fetch from server
		xhrPromise = new Promise((resolve, reject) => {
			fetch({ ...data, headers: this.options.requestHeaders }, (response) => {
				if (response.status === 500) {
					this.triggerEvent('serverError');
					reject(url);
					return;
				}
				// get json data
				const page = this.getPageData(response);
				if (!page || !page.blocks.length) {
					reject(url);
					return;
				}
				// render page
				const cacheablePageData = { ...page, url };
				this.cache.cacheUrl(cacheablePageData);
				this.triggerEvent('pageLoaded');
				resolve(cacheablePageData);
			});
		});
	}

	// when everything is ready, handle the outcome
	// @ts-ignore two different promises should be fine to concat 🤷
	Promise.all([xhrPromise].concat(animationPromises))
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
