import { updateHistoryRecord, getCurrentUrl } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

export const renderPage = async function (this: Swup, requestedUrl: string, page: PageData) {
	const { url } = page;

	document.documentElement.classList.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), requestedUrl)) {
		return;
	}

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		this.currentPageUrl = getCurrentUrl();
		updateHistoryRecord(url);
	}

	// only add for page loads with transitions
	if (this.context.animate) {
		document.documentElement.classList.add('is-rendering');
	}

	await this.hooks.trigger('willReplaceContent');
	await this.replaceContent(page);
	await this.hooks.trigger('contentReplaced');
	await this.hooks.trigger('pageView');

	// empty cache if it's disabled (in case preload plugin filled it)
	if (!this.options.cache) {
		this.cache.empty();
	}

	// Perform in transition
	this.enterPage();
};
