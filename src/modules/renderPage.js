import { Link, updateHistoryRecord } from '../helpers';
import { query } from '../utils';


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

	const replaceBlocks = () => {
		this.triggerEvent('willReplaceContent', popstate);
		page.blocks.forEach((html, i) => {
			const block = query(`[data-swup="${i}"]`, document.body);
			block.outerHTML = html;
		});
		this.triggerEvent('contentReplaced', popstate);
	};

	const replaceFragments = () => {
		if (!fragment) {
			return false;
		}

		const fragments = Object.entries(page.fragments);
		if (!fragments.length) {
			console.warn('[swup] No fragments found, replacing whole page');
			return false;
		}
		if (typeof fragment === 'string' && !fragments[fragment]) {
			console.warn(`[swup] Fragment "${fragment}" not found, replacing whole page`);
			return false;
		}

		document.documentElement.classList.add('is-fragment');

		this.triggerEvent('willReplaceFragments', popstate);
		fragments.forEach(([name, html], i) => {
			if (fragment === true || fragment === name) {
				const container = query(`[${this.options.fragmentContainerAttr}="${name}"]`, document.body);
				if (container) {
					container.outerHTML = html;
				}
			}
		});
		this.triggerEvent('fragmentsReplaced', popstate);
	};

	// Try fragments first, if not, then blocks
	if (replaceFragments() === false) {
		replaceBlocks();
	}

	// set title
	document.title = page.title;
	this.triggerEvent('pageView', popstate);

	// empty cache if it's disabled (because pages could be preloaded and stuff)
	if (!this.options.cache) {
		this.cache.empty();
	}

	// Perform transition
	if (!skipTransition) {
		setTimeout(() => {
			this.triggerEvent('animationInStart');
			document.documentElement.classList.remove('is-animating');
		}, 10);

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
