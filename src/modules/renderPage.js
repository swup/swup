import { Link, getCurrentUrl } from '../helpers.js';

const renderPage = function(page, popstate) {
	document.documentElement.classList.remove('is-leaving');

	const isCurrentPage = this.isSameResolvedPath(getCurrentUrl(), page.url);
	if (!isCurrentPage) return;

	// replace state in case the url was redirected
	const url = new Link(page.responseURL).getPath();
	if (!this.isSameResolvedPath(window.location.pathname, url)) {
		window.history.replaceState(
			{
				url,
				random: Math.random(),
				source: 'swup'
			},
			document.title,
			url
		);

		// save new record for redirected url
		this.cache.cacheUrl({ ...page, url });

		this.currentPath = getCurrentUrl();
	}

	// only add for non-popstate transitions
	if (!popstate || this.options.animateHistoryBrowsing) {
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
	setTimeout(() => {
		if (!popstate || this.options.animateHistoryBrowsing) {
			this.triggerEvent('animationInStart');
			document.documentElement.classList.remove('is-animating');
		}
	}, 10);

	// handle end of animation
	if (!popstate || this.options.animateHistoryBrowsing) {
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
