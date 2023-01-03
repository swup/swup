import { Location, updateHistoryRecord, getCurrentUrl } from '../helpers.js';

const renderPage = function(page, { popstate } = {}) {
	document.documentElement.classList.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), page.url)) {
		return;
	}

	const skipTransition = popstate && !this.options.animateHistoryBrowsing;

	const { url } = Location.fromUrl(page.responseURL);

	// update cache and state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		this.cache.cacheUrl({ ...page, url });
		this.currentPageUrl = getCurrentUrl();
		updateHistoryRecord(url);
	}

	// only add for page loads with transitions
	if (!skipTransition) {
		document.documentElement.classList.add('is-rendering');
	}

	this.triggerEvent('willReplaceContent', popstate);

	this.replaceContent().then(() => {
		this.triggerEvent('contentReplaced', popstate);
		this.triggerEvent('pageView', popstate);

		// empty cache if it's disabled (because pages could be preloaded and stuff)
		if (!this.options.cache) {
			this.cache.empty();
		}

		// Perform in transition
		this.enterPage({ popstate, skipTransition });

		// reset scroll-to element
		this.scrollToElement = null;
	});
};

export default renderPage;
