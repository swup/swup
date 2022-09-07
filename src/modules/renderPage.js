import { Link, updateHistoryRecord } from '../helpers.js';
import { query, queryAll, nextTick, compareArrays } from '../utils.js';

const renderPage = function(page, { popstate, fragment } = {}) {
	document.documentElement.classList.remove('is-leaving');

	const isCurrentPage = this.getCurrentUrl() === page.url;
	if (!isCurrentPage) {
		console.log('not current page:', this.getCurrentUrl(), 'vs', page.url, page);
		return;
	}

	const skipTransition = fragment || (popstate && !this.options.animateHistoryBrowsing);

	// replace state in case the url was redirected
	const url = new Link(page.responseURL).getAddress();
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
		const fragments = Object.entries(page.fragments);
		if (!fragments.length) {
			console.warn('[swup] No fragments found, replacing whole page');
			return false;
		}

		const { fragmentContainerAttr } = this.options;
		const fragmentsOnPage = queryAll(`[${fragmentContainerAttr}]`).filter(el => fragment === true || fragment === el.getAttribute(fragmentContainerAttr));
		const fragmentsToReplace = fragments.filter(([name]) => fragment === true || fragment === name);
		const hasIdenticalFragmentContainers = compareArrays(
			fragmentsOnPage.map((el) => el.getAttribute(fragmentContainerAttr)),
			fragmentsToReplace.map(([name]) => name)
		);

		if (!hasIdenticalFragmentContainers) {
			console.warn('[swup] Mismatching fragments on current and new page, replacing whole page');
			return false;
		}

		if (fragment === 'string' && !page.fragments[fragment]) {
			console.warn(`[swup] Fragment "${fragment}" not found, replacing whole page`);
			return false;
		}

		document.documentElement.classList.add('is-fragment');

		this.triggerEvent('willReplaceContent', popstate);
		this.triggerEvent('willReplaceFragments', popstate);
		fragmentsToReplace.forEach(([name, html]) => {
			const container = query(`[${fragmentContainerAttr}="${name}"]`);
			if (container) {
				container.outerHTML = html;
			}
		});
		this.triggerEvent('contentReplaced', popstate);
		this.triggerEvent('fragmentsReplaced', popstate);
	};

	// Try fragments first, if not, then blocks
	if (fragment) {
		if (replaceFragments() === false) {
			console.log('Fragments failed, replacing blocks');
			nextTick(() => {
				this.loadPage({ url }, popstate);
			});
			return;
		}
	} else {
		replaceBlocks();
	}

	// set title
	document.title = page.title;
	this.triggerEvent('pageView', popstate);

	// empty cache if it's disabled (because pages could be preloaded and stuff)
	if (!this.options.cache) {
		this.cache.empty();
	}

	// Perform in transition
	this.enterPage({ popstate, skipTransition });

	// reset scroll-to element
	this.scrollToElement = null;
};

export default renderPage;
