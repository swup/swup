import delegate from 'delegate-it';

import version from './config/version.js';

import {
	cleanupAnimationClasses,
	delegateEvent,
	getCurrentUrl,
	Location,
	markSwupElements,
	updateHistoryRecord
} from './helpers.js';
import { Unsubscribe } from './helpers/delegateEvent.js';

import { Cache } from './modules/Cache.js';
import { enterPage } from './modules/enterPage.js';
import { getAnchorElement } from './modules/getAnchorElement.js';
import { getAnimationPromises } from './modules/getAnimationPromises.js';
import { getPageData } from './modules/getPageData.js';
import { fetchPage } from './modules/fetchPage.js';
import { leavePage } from './modules/leavePage.js';
import { loadPage, performPageLoad } from './modules/loadPage.js';
import { replaceContent } from './modules/replaceContent.js';
import { on, off, triggerEvent, Handlers } from './modules/events.js';
import { use, unuse, findPlugin, Plugin } from './modules/plugins.js';
import { renderPage } from './modules/renderPage.js';
import { updateTransition, shouldSkipTransition } from './modules/transitions.js';

import { queryAll } from './utils.js';

export type Transition = {
	from?: string;
	to?: string;
	custom?: string;
};

type DelegatedListeners = {
	click?: Unsubscribe;
};

export type Options = {
	animateHistoryBrowsing: boolean;
	animationSelector: string | false;
	linkSelector: string;
	cache: boolean;
	containers: string[];
	requestHeaders: Record<string, string>;
	plugins: Plugin[];
	skipPopStateHandling: (event: any) => boolean;
	ignoreVisit: (url: string, { el, event }: { el?: Element; event?: Event }) => boolean;
	resolveUrl: (url: string) => string;
};

export default class Swup {
	version = version;

	_handlers: Handlers = {
		animationInDone: [],
		animationInStart: [],
		animationOutDone: [],
		animationOutStart: [],
		animationSkipped: [],
		clickLink: [],
		contentReplaced: [],
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
		willReplaceContent: []
	};

	// variable for anchor to scroll to after render
	scrollToElement: string | null = null;
	// variable for save options
	options: Options;
	// running plugin instances
	plugins: Plugin[] = [];
	// variable for current transition info object
	transition: Transition = {};
	// cache instance
	cache: Cache;
	// allows us to compare the current and new path inside popStateHandler
	currentPageUrl = getCurrentUrl();
	// variable for keeping event listeners from "delegate"
	delegatedListeners: DelegatedListeners = {};
	// so we are able to remove the listener
	boundPopStateHandler: (event: PopStateEvent) => void;

	loadPage = loadPage;
	performPageLoad = performPageLoad;
	leavePage = leavePage;
	renderPage = renderPage;
	replaceContent = replaceContent;
	enterPage = enterPage;
	triggerEvent = triggerEvent;
	delegateEvent = delegateEvent;
	on = on;
	off = off;
	updateTransition = updateTransition;
	shouldSkipTransition = shouldSkipTransition;
	getAnimationPromises = getAnimationPromises;
	getPageData = getPageData;
	fetchPage = fetchPage;
	getAnchorElement = getAnchorElement;
	log: (message: string, context?: any) => void = () => {}; // here so it can be used by plugins
	use = use;
	unuse = unuse;
	findPlugin = findPlugin;
	getCurrentUrl = getCurrentUrl;
	cleanupAnimationClasses = cleanupAnimationClasses;

	defaults: Options = {
		animateHistoryBrowsing: false,
		animationSelector: '[class*="transition-"]',
		cache: true,
		containers: ['#swup'],
		ignoreVisit: (url, { el, event } = {}) => !!el?.closest('[data-no-swup]'),
		linkSelector: 'a[href]',
		plugins: [],
		resolveUrl: (url) => url,
		requestHeaders: {
			'X-Requested-With': 'swup',
			Accept: 'text/html, application/xhtml+xml'
		},
		skipPopStateHandling: (event) => event.state?.source !== 'swup'
	};

	constructor(options: Partial<Options> = {}) {
		// Merge defaults and options
		this.options = { ...this.defaults, ...options };

		this.boundPopStateHandler = this.popStateHandler.bind(this);

		this.cache = new Cache(this);

		this.enable();
	}

	enable() {
		// Check for Promise support
		if (typeof Promise === 'undefined') {
			console.warn('Promise is not supported');
			return;
		}

		// Add event listeners
		this.delegatedListeners.click = delegateEvent(
			this.options.linkSelector,
			'click',
			this.linkClickHandler.bind(this)
		);

		window.addEventListener('popstate', this.boundPopStateHandler);

		// Initial save to cache
		if (this.options.cache) {
			// Disabled to avoid caching modified dom state: logic moved to preload plugin
			// https://github.com/swup/swup/issues/475
		}

		// Mark swup blocks in html
		markSwupElements(document.documentElement, this.options.containers);

		// Mount plugins
		this.options.plugins.forEach((plugin) => this.use(plugin));

		// Modify initial history record
		updateHistoryRecord();

		// Trigger enabled event
		this.triggerEvent('enabled');

		// Add swup-enabled class to html tag
		document.documentElement.classList.add('swup-enabled');

		// Trigger page view event
		this.triggerEvent('pageView');
	}

	destroy() {
		// remove delegated listeners
		this.delegatedListeners.click!.destroy();

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

	shouldIgnoreVisit(href: string, { el, event }: { el?: Element; event?: Event } = {}) {
		const { origin, url, hash } = Location.fromUrl(href);

		// Ignore if the new origin doesn't match the current one
		if (origin !== window.location.origin) {
			return true;
		}

		// Ignore if the link/form would open a new window (or none at all)
		if (el && this.triggerWillOpenNewWindow(el)) {
			return true;
		}

		// Ignore if the visit should be ignored as per user options
		if (this.options.ignoreVisit(url + hash, { el, event })) {
			return true;
		}

		// Finally, allow the visit
		return false;
	}

	linkClickHandler(event: delegate.Event<MouseEvent>) {
		const linkEl = event.delegateTarget;
		const { href, url, hash } = Location.fromElement(linkEl as HTMLAnchorElement);

		// Exit early if the link should be ignored
		if (this.shouldIgnoreVisit(href, { el: linkEl, event })) {
			return;
		}

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

		// Handle links to the same page and exit early, where applicable
		if (!url || url === getCurrentUrl()) {
			this.handleLinkToSamePage(url, hash, event);
			return;
		}

		// Exit early if the resolved path hasn't changed
		if (this.isSameResolvedUrl(url, getCurrentUrl())) return;

		// Store the element that should be scrolled to after loading the next page
		this.scrollToElement = hash || null;

		// Get the custom transition name, if present
		const customTransition = linkEl.getAttribute('data-swup-transition') || undefined;

		// Finally, proceed with loading the page
		this.performPageLoad({ url, customTransition });
	}

	handleLinkToSamePage(url: string, hash: string, event: delegate.Event<MouseEvent>) {
		// Emit event and exit early if the url points to the same page without hash
		if (!hash) {
			this.triggerEvent('samePage', event);
			return;
		}

		// link to the same URL with hash
		this.triggerEvent('samePageWithHash', event);

		const element = getAnchorElement(hash);

		// Warn and exit early if no matching element was found for the hash
		if (!element) {
			return console.warn(`Element for offset not found (#${hash})`);
		}

		updateHistoryRecord(url + hash);
	}

	triggerWillOpenNewWindow(triggerEl: Element) {
		if (triggerEl.matches('[download], [target="_blank"]')) {
			return true;
		}
		return false;
	}

	popStateHandler(event: PopStateEvent) {
		// Exit early if this event should be ignored
		if (this.options.skipPopStateHandling(event)) {
			return;
		}

		// Exit early if the resolved path hasn't changed
		if (this.isSameResolvedUrl(getCurrentUrl(), this.currentPageUrl)) {
			return;
		}

		const href = event.state?.url ?? location.href;

		// Exit early if the link should be ignored
		if (this.shouldIgnoreVisit(href, { event })) {
			return;
		}

		const { url, hash } = Location.fromUrl(href);

		if (hash) {
			this.scrollToElement = hash;
		} else {
			event.preventDefault();
		}

		this.triggerEvent('popState', event);

		if (!this.options.animateHistoryBrowsing) {
			document.documentElement.classList.remove('is-animating');
			cleanupAnimationClasses();
		}

		this.performPageLoad({ url, event });
	}

	/**
	 * Utility function to validate and run the global option 'resolveUrl'
	 * @param {string} url
	 * @returns {string} the resolved url
	 */
	resolveUrl(url: string) {
		if (typeof this.options.resolveUrl !== 'function') {
			console.warn(`[swup] options.resolveUrl expects a callback function.`);
			return url;
		}
		const result = this.options.resolveUrl(url);
		if (!result || typeof result !== 'string') {
			console.warn(`[swup] options.resolveUrl needs to return a url`);
			return url;
		}
		if (result.startsWith('//') || result.startsWith('http')) {
			console.warn(`[swup] options.resolveUrl needs to return a relative url`);
			return url;
		}
		return result;
	}

	/**
	 * Compares the resolved version of two paths and returns true if they are the same
	 * @param {string} url1
	 * @param {string} url2
	 * @returns {boolean}
	 */
	isSameResolvedUrl(url1: string, url2: string) {
		return this.resolveUrl(url1) === this.resolveUrl(url2);
	}
}
