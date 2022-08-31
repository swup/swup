import { classify, createHistoryRecord, fetch } from '../helpers';

const loadPage = function(data, popstate = false) {
	let animationPromises = []
	let xhrPromise;

	const { url, fragment, customTransition } = data;
	const skipTransition = fragment || (popstate && !this.options.animateHistoryBrowsing);

	const animateOut = () => {
		this.triggerEvent('animationOutStart');

		// handle classes
		document.documentElement.classList.add('is-changing');
		document.documentElement.classList.add('is-leaving');
		document.documentElement.classList.add('is-animating');
		if (popstate) {
			document.documentElement.classList.add('is-popstate');
		}
		document.documentElement.classList.add(`to-${classify(url)}`);

		// animation promise stuff
		animationPromises = this.getAnimationPromises('out');
		Promise.all(animationPromises).then(() => {
			this.triggerEvent('animationOutDone');
		});

		// create history record if this is not a popstate call (with or without anchor)
		if (!popstate) {
			createHistoryRecord(url + (this.scrollToElement || ''), { fragment });
		}
	};

	this.triggerEvent('transitionStart', popstate);

	// set transition object
	if (customTransition != null) {
		this.updateTransition(window.location.pathname, url, customTransition);
		document.documentElement.classList.add(`to-${classify(customTransition)}`);
	} else {
		this.updateTransition(window.location.pathname, url);
	}

	// start/skip animation
	if (skipTransition) {
		this.triggerEvent('animationSkipped');
	} else {
		animateOut();
	}

	// start/skip loading of page
	if (this.cache.exists(url)) {
		xhrPromise = new Promise((resolve) => {
			resolve(this.cache.getPage(url));
		});
		this.triggerEvent('pageRetrievedFromCache');
	} else {
		if (!this.preloadPromise || this.preloadPromise.route != url) {
			xhrPromise = new Promise((resolve, reject) => {
				fetch({ ...data, headers: this.options.requestHeaders }, (response) => {
					if (response.status === 500) {
						this.triggerEvent('serverError');
						reject(url);
						return;
					} else {
						// get json data
						let page = this.getPageData(response);
						if (page != null && page.blocks.length > 0) {
							page.url = url;
						} else {
							reject(url);
							return;
						}
						// render page
						this.cache.cacheUrl(page);
						this.triggerEvent('pageLoaded');
						resolve(page);
					}
				});
			});
		} else {
			xhrPromise = this.preloadPromise;
		}
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
