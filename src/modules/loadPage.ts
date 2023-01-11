import { classify, createHistoryRecord, getCurrentUrl } from '../helpers.js';
import Swup from '../Swup.js';

export type TransitionOptions = {
	url: string;
	customTransition?: string;
};

const loadPage = function(this: Swup, data: TransitionOptions, popstate: PopStateEvent | null) {
	const { url, customTransition } = data;
	const skipTransition = !!(popstate && !this.options.animateHistoryBrowsing);

	this.triggerEvent('transitionStart', popstate || undefined);

	// set transition object
	this.updateTransition(getCurrentUrl(), url, customTransition);
	if (customTransition != null) {
		document.documentElement.classList.add(`to-${classify(customTransition)}`);
	}

	// start/skip animation
	const animationPromises = this.leavePage(data, { popstate, skipTransition });

	// create history record if this is not a popstate call (with or without anchor)
	if (!popstate) {
		createHistoryRecord(url + (this.scrollToElement || ''));
	}

	this.currentPageUrl = getCurrentUrl();

	// Load page data
	const fetchPromise = this.fetchPage(data);

	// when everything is ready, render the page
	Promise.all([fetchPromise, ...animationPromises])
		.then(([pageData]) => {
			this.renderPage(pageData, { popstate, skipTransition });
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
