import { Link, updateHistoryRecord } from '../helpers';

const renderPage = function(page, { popstate, fragment, skipTransition } = {}) {
	document.documentElement.classList.remove('is-leaving');

	const isCurrentPage = this.getCurrentUrl() === page.url;
	if (!isCurrentPage) return;

	// replace state in case the url was redirected
	const url = new Link(page.responseURL).getPath();
	if (window.location.pathname !== url) {
		updateHistoryRecord(url);

		// save new record for redirected url
		this.cache.cacheUrl({ ...page, url });
	}

	// only add for page loads with transitions
	if (!skipTransition) {
		document.documentElement.classList.add('is-rendering');
	}

	this.triggerEvent('willReplaceContent', popstate);
	// replace blocks
	for (let i = 0; i < page.blocks.length; i++) {
		document.body.querySelector(`[data-swup="${i}"]`).outerHTML = page.blocks[i];
	}
	// set title
	document.title = page.title;
	this.triggerEvent('contentReplaced', popstate);
	this.triggerEvent('pageView', popstate);

	// empty cache if it's disabled (because pages could be preloaded and stuff)
	if (!this.options.cache) {
		this.cache.empty();
	}

	// start animation IN
	if (!skipTransition) {
		setTimeout(() => {
			this.triggerEvent('animationInStart');
			document.documentElement.classList.remove('is-animating');
		}, 10);
	}

	// handle end of animation
	if (!skipTransition) {
		const animationPromises = this.getAnimationPromises('in');
		Promise.all(animationPromises).then(() => {
			this.triggerEvent('animationInDone');
			this.triggerEvent('transitionEnd', popstate);
			this.cleanupAnimationClasses();
		});
	} else {
		this.triggerEvent('transitionEnd', popstate);
	}

	// reset scroll-to element
	this.scrollToElement = null;
};

export default renderPage;
