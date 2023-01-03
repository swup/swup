import { classify, createHistoryRecord, fetch, getCurrentUrl } from '../helpers.js';

const loadPage = function(data, popstate = false) {
	let animationPromises = [];
	let xhrPromise;

	const { url, customTransition } = data;
	const skipTransition = popstate && !this.options.animateHistoryBrowsing;

	this.triggerEvent('transitionStart', popstate);

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
			const { abort } = fetch({ ...data, headers: this.options.requestHeaders }, (response) => {
				// Reject without URL for aborted requests (will prevent browser reloads)
				if (response.error === 'aborted') {
					reject();
					return;
				}
				// Reject with URL for arbitary errors in fetch
				if (response.error) {
					reject(url);
					return;
				}
				// Reject with URL for server errors
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
				page.url = url;
				this.cache.cacheUrl(page);
				this.triggerEvent('pageLoaded');
				resolve(page);
			});
		});
	}

	// when everything is ready, handle the outcome
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
