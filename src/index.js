import delegate from 'delegate-it';

// modules
import Cache from './modules/Cache.js';
import loadPage from './modules/loadPage.js';
import leavePage from './modules/leavePage.js';
import renderPage from './modules/renderPage.js';
import enterPage from './modules/enterPage.js';
import triggerEvent from './modules/triggerEvent.js';
import on from './modules/on.js';
import off from './modules/off.js';
import updateTransition from './modules/updateTransition.js';
import getAnchorElement from './modules/getAnchorElement.js';
import getAnimationPromises from './modules/getAnimationPromises.js';
import getPageData from './modules/getPageData.js';
import { use, unuse, findPlugin } from './modules/plugins.js';

import { queryAll } from './utils.js';
import {
	getCurrentUrl,
	markSwupElements,
	Link,
	cleanupAnimationClasses,
	updateHistoryRecord
} from './helpers.js';

export default class Swup {
	constructor(setOptions) {
		// default options
		let defaults = {
			animateHistoryBrowsing: false,
			animationSelector: '[class*="transition-"]',
			linkSelector: `a[href^="${
				window.location.origin
			}"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])`,
			cache: true,
			containers: ['#swup'],
			requestHeaders: {
				'X-Requested-With': 'swup',
				Accept: 'text/html, application/xhtml+xml'
			},
			plugins: [],
			skipPopStateHandling: function(event) {
				return !(event.state && event.state.source === 'swup');
			},
			fragmentTargetAttr: 'data-swup-to-fragment',
			fragmentContainerAttr: 'data-swup-fragment-container'
		};

		// merge options
		const options = {
			...defaults,
			...setOptions
		};

		// handler arrays
		this._handlers = {
			animationInDone: [],
			animationInStart: [],
			animationOutDone: [],
			animationOutStart: [],
			animationSkipped: [],
			clickLink: [],
			contentReplaced: [],
			fragmentsReplaced: [],
			disabled: [],
			enabled: [],
			openPageInNewTab: [],
			pageLoaded: [],
			pageRetrievedFromCache: [],
			pageView: [],
			popState: [],
			samePage: [],
			samePageWithHash: [],
			serverError: [],
			transitionStart: [],
			transitionEnd: [],
			willReplaceContent: [],
			willReplaceFragments: []
		};

		// variable for anchor to scroll to after render
		this.scrollToElement = null;
		// variable for promise used for preload, so no new loading of the same page starts while page is loading
		this.preloadPromise = null;
		// variable for save options
		this.options = options;
		// variable for plugins array
		this.plugins = [];
		// variable for current transition object
		this.transition = {};
		// variable for keeping event listeners from "delegate"
		this.delegatedListeners = {};
		// so we are able to remove the listener
		this.boundPopStateHandler = this.popStateHandler.bind(this);

		// make modules accessible in instance
		this.cache = new Cache();
		this.cache.swup = this;
		this.loadPage = loadPage;
		this.leavePage = leavePage;
		this.renderPage = renderPage;
		this.enterPage = enterPage;
		this.triggerEvent = triggerEvent;
		this.on = on;
		this.off = off;
		this.updateTransition = updateTransition;
		this.getAnimationPromises = getAnimationPromises;
		this.getPageData = getPageData;
		this.getAnchorElement = getAnchorElement;
		this.log = () => {}; // here so it can be used by plugins
		this.use = use;
		this.unuse = unuse;
		this.findPlugin = findPlugin;
		this.getCurrentUrl = getCurrentUrl;
		this.cleanupAnimationClasses = cleanupAnimationClasses;

		// enable swup
		this.enable();
	}

	enable() {
		// check for Promise support
		if (typeof Promise === 'undefined') {
			console.warn('Promise is not supported');
			return;
		}

		// add event listeners
		this.delegatedListeners.click = delegate(
			document,
			this.options.linkSelector,
			'click',
			this.linkClickHandler.bind(this)
		);
		window.addEventListener('popstate', this.boundPopStateHandler);

		// initial save to cache
		if (this.options.cache) {
			// disabled to avoid caching modified dom state
			// https://github.com/swup/swup/issues/475
			// logic moved to preload plugin
		}

		// mark swup blocks in html
		markSwupElements(document.documentElement, this.options.containers);

		// mount plugins
		this.options.plugins.forEach((plugin) => {
			this.use(plugin);
		});

		// modify initial history record wth swup data
		updateHistoryRecord();

		// trigger enabled event
		this.triggerEvent('enabled');

		// add swup-enabled class to html tag
		document.documentElement.classList.add('swup-enabled');

		// trigger page view event
		this.triggerEvent('pageView');
	}

	destroy() {
		// remove delegated listeners
		this.delegatedListeners.click.destroy();

		// remove popstate listener
		window.removeEventListener('popstate', this.boundPopStateHandler);

		// empty cache
		this.cache.empty();

		// unmount plugins
		this.options.plugins.forEach((plugin) => {
			this.unuse(plugin);
		});

		// remove swup data atributes from blocks
		queryAll('[data-swup]').forEach((element) => {
			element.removeAttribute('data-swup');
		});

		// remove handlers
		this.off();

		// trigger disable event
		this.triggerEvent('disabled');

		// remove swup-enabled class from html tag
		document.documentElement.classList.remove('swup-enabled');
	}

	linkClickHandler(event) {
		// Exit early if control key pressed
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			this.triggerEvent('openPageInNewTab', event);
			return;
		}

		// Exit early if other than left mouse button
		if (event.button !== 0) {
			return;
		}

		this.triggerEvent('clickLink', event);
		event.preventDefault();

		const link = new Link(event.delegateTarget);
		const url = link.getAddress();
		const hash = link.getHash();

		if (url == getCurrentUrl() || url == '') {
			if (!hash) {
				// link to the same URL without hash
				this.triggerEvent('samePage', event);
			} else {
				// link to the same URL with hash
				this.triggerEvent('samePageWithHash', event);
				const element = getAnchorElement(hash);
				if (element) {
					updateHistoryRecord(url + hash);
				} else {
					console.warn(`Element for offset not found (#${hash})`);
				}
			}
		} else {
			// link to different url

			this.scrollToElement = hash || null;
			const customTransition = event.delegateTarget.getAttribute('data-swup-transition');

			let fragment = false;
			const { fragmentTargetAttr: attr } = this.options;
			const targetEl = event.delegateTarget.closest(`[${attr}]`);
			if (targetEl && targetEl.matches(`[${attr}]:not([${attr}="_top"])`)) {
				fragment = targetEl.getAttribute(attr) || true;
			}

			// load page
			this.loadPage({ url, fragment, customTransition }, false);
		}
	}

	popStateHandler(event) {
		if (this.options.skipPopStateHandling(event)) {
			return;
		}

		const { url = window.location.href, fragment } = event.state || {};

		const link = new Link(url);
		if (link.getHash()) {
			this.scrollToElement = link.getHash();
		} else {
			event.preventDefault();
		}

		this.triggerEvent('popState', event);

		if (!this.options.animateHistoryBrowsing) {
			document.documentElement.classList.remove('is-animating');
			cleanupAnimationClasses();
		}

		this.loadPage({ url: link.getAddress(), fragment }, event);
	}
}
