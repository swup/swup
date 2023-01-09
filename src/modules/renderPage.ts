import { Location, updateHistoryRecord, getCurrentUrl } from '../helpers.js';
import Swup from '../index';
import { PageRecord } from './Cache';

const renderPage = function(
	this: Swup,
	page: PageRecord,
	{ popstate, skipTransition }: { popstate: PopStateEvent | null; skipTransition?: boolean } = {
		popstate: null
	}
) {
	document.documentElement.classList.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), page.url)) {
		return;
	}

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

	this.triggerEvent('willReplaceContent', popstate || undefined);

	this.replaceContent(page).then(() => {
		this.triggerEvent('contentReplaced', popstate || undefined);
		this.triggerEvent('pageView', popstate || undefined);

		// empty cache if it's disabled (because pages could be preloaded and stuff)
		if (!this.options.cache) {
			this.cache.empty();
		}

		// Perform in transition
		this.enterPage({ popstate: popstate || undefined, skipTransition });

		// reset scroll-to element
		this.scrollToElement = null;
	});
};

export default renderPage;
