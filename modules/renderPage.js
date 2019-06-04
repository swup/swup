import { queryAll } from '../utils';
import { transitionEnd, Link } from '../helpers';

const renderPage = function(page, popstate) {
	document.documentElement.classList.remove('is-leaving');

	// replace state in case the url was redirected
	let link = new Link(page.responseURL);
	if (window.location.pathname !== link.getPath()) {
		window.history.replaceState(
			{
				url: link.getPath(),
				random: Math.random(),
				source: 'swup'
			},
			document.title,
			link.getPath()
		);

		// save new record for redirected url
		this.cache.cacheUrl({ ...page, url: link.getPath() });
	}

	// only add for non-popstate transitions
	if (!popstate || this.options.animateHistoryBrowsing) {
		document.documentElement.classList.add('is-rendering');
	}

	this.triggerEvent('willReplaceContent', popstate);

	// replace blocks
	for (let i = 0; i < page.blocks.length; i++) {
		document.querySelector(`[data-swup="${i}"]`).outerHTML = page.blocks[i];
	}

	// FIXME : Removed empty <head> injected if the container is <body>
	// https://stackoverflow.com/questions/52888347/setting-document-body-outerhtml-creates-empty-heads-why
	if (document.getElementsByTagName('head').length > 1) {
		let emptyHead = document.getElementsByTagName('head')[1]
		emptyHead.parentNode.removeChild(emptyHead)
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
	const animationPromises = this.getAnimationPromises('in');
	if (!popstate || this.options.animateHistoryBrowsing) {
		Promise.all(animationPromises).then(() => {
			this.triggerEvent('animationInDone');
			this.triggerEvent('transitionEnd', popstate);
			// remove "to-{page}" classes
			document.documentElement.className.split(' ').forEach((classItem) => {
				if (
					new RegExp('^to-').test(classItem) ||
					classItem === 'is-changing' ||
					classItem === 'is-rendering' ||
					classItem === 'is-popstate'
				) {
					document.documentElement.classList.remove(classItem);
				}
			});
		});
	} else {
		this.triggerEvent('transitionEnd', popstate);
	}

	// reset scroll-to element
	this.scrollToElement = null;
};

export default renderPage;
