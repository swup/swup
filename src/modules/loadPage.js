import { queryAll } from '../utils';
import { classify, createHistoryRecord, getDataFromHTML, fetch, transitionEnd } from '../helpers';

module.exports = function(data, popstate) {
	// scrolling
	if (this.options.doScrollingRightAway && !this.scrollToElement) {
		this.doScrolling(popstate);
	}

	// create array for storing animation promises
	let animationPromises = [];

	// set transition object
	if (data.customTransition != null) {
		this.updateTransition(window.location.pathname, data.url, data.customTransition);
		document.documentElement.classList.add(`to-${classify(data.customTransition)}`);
	} else {
		this.updateTransition(window.location.pathname, data.url);
	}

	if (!popstate || this.options.animateHistoryBrowsing) {
		// start animation
		this.triggerEvent('animationOutStart');
		document.documentElement.classList.add('is-changing');
		document.documentElement.classList.add('is-leaving');
		document.documentElement.classList.add('is-animating');
		if (popstate) {
			document.documentElement.classList.add('is-popstate');
		}
		document.documentElement.classList.add('to-' + classify(data.url));

		// detect animation end
		let animatedElements = queryAll(this.options.animationSelector);
		animatedElements::forEach((element) => {
			const promise = new Promise((resolve) => {
				element.addEventListener(transitionEnd(), (event) => {
					if (element == event.target) {
						resolve();
					}
				});
			});
			animationPromises.push(promise);
		});

		Promise.all(animationPromises).then(() => {
			this.triggerEvent('animationOutDone');
		});

		// create pop element with or without anchor
		let pop;
		if (this.scrollToElement != null) {
			pop = data.url + this.scrollToElement;
		} else {
			pop = data.url;
		}
		if (!popstate) createHistoryRecord(pop);
	} else {
		// proceed without animating
		this.triggerEvent('animationSkipped');
	}

	if (this.cache.exists(data.url)) {
		const xhrPromise = new Promise((resolve) => {
			resolve();
		});
		this.triggerEvent('pageRetrievedFromCache');
	} else {
		if (!this.preloadPromise || this.preloadPromise.route != data.url) {
			const xhrPromise = new Promise((resolve, reject) => {
				fetch(data, (response, request) => {
					if (request.status === 500) {
						this.triggerEvent('serverError');
						reject(data.url);
						return;
					} else {
						// get json data
						let page = getDataFromHTML(response, request);
						if (page != null) {
							page.url = data.url;
						} else {
							reject(data.url);
							return;
						}
						// render page
						this.cache.cacheUrl(page, this.options.debugMode);
						this.triggerEvent('pageLoaded');
					}
					resolve();
				});
			});
		} else {
			const xhrPromise = this.preloadPromise;
		}
	}

	Promise.all(animationPromises.concat([xhrPromise]))
		.then(() => {
			// render page
			this.renderPage(this.cache.getPage(data.url), popstate);
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
