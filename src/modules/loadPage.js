import { classify, createHistoryRecord, updateHistoryRecord, fetch, getCurrentUrl } from '../helpers.js';

const loadPage = function(data, popstate = false) {
	let animationPromises = [];
	let xhrPromise;

	const { url, fragment, customTransition } = data;
	const skipTransition = fragment || (popstate && !this.options.animateHistoryBrowsing);

	this.triggerEvent('transitionStart', popstate);

	// set transition object
	this.updateTransition(window.location.pathname, url, customTransition);
	if (customTransition != null) {
		document.documentElement.classList.add(`to-${classify(customTransition)}`);
	}

	// start/skip animation
	animationPromises = this.leavePage(data, { popstate, skipTransition });

	// create history record if this is not a popstate call (with or without anchor)
	if (!popstate) {
		// enables fragment replacement during history browsing
		updateHistoryRecord(this.currentURL, { fragment });
		createHistoryRecord(url + (this.scrollToElement || ''), { fragment });
	}

	this.currentURL = getCurrentUrl();

	// Load page data
	if (this.cache.exists(url)) {
		// Found in Cache, resolve directly
		xhrPromise = Promise.resolve(this.cache.getPage(url));
		this.triggerEvent('pageRetrievedFromCache');
	} else if (this.preloadPromise && this.preloadPromise.route === url) {
		// Alreay preloading, re-use
		xhrPromise = this.preloadPromise;
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
			this.renderPage(pageData, { popstate, fragment, skipTransition });
			this.preloadPromise = null;
		})
		.catch((errorUrl) => {
			// rewrite the skipPopStateHandling function to redirect manually when the history.go is processed
			this.options.skipPopStateHandling = function() {
				window.location = errorUrl;
				return true;
			};

			// go back to the actual page were still at
			window.history.go(-1);
		});
};

export default loadPage;
