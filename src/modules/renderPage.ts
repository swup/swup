import { Location, updateHistoryRecord, getCurrentUrl } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

export type PageRenderOptions = {
	event?: PopStateEvent;
	skipTransition?: boolean;
};

export const renderPage = function (
	this: Swup,
	requestedUrl: string,
	page: PageData,
	{ event, skipTransition }: PageRenderOptions = {}
) {
	document.documentElement.classList.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), requestedUrl)) {
		return;
	}

	const { url } = page;

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		this.currentPageUrl = getCurrentUrl();
		updateHistoryRecord(url);
	}

	// only add for page loads with transitions
	if (!skipTransition) {
		document.documentElement.classList.add('is-rendering');
	}

	this.triggerEvent('willReplaceContent', event);

	this.replaceContent(page).then(() => {
		this.triggerEvent('contentReplaced', event);
		this.triggerEvent('pageView', event);

		// empty cache if it's disabled (in case preload plugin filled it)
		if (!this.options.cache) {
			this.cache.empty();
		}

		// Perform in transition
		this.enterPage({ event, skipTransition });

		// reset scroll-to element
		this.scrollToElement = null;
	});
};
