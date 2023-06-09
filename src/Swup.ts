import { DelegateEvent } from 'delegate-it';

import version from './config/version.js';

import {
	cleanupAnimationClasses,
	delegateEvent,
	getCurrentUrl,
	Location,
	updateHistoryRecord
} from './helpers.js';
import { Unsubscribe } from './helpers/delegateEvent.js';

import { Cache } from './modules/Cache.js';
import { enterPage } from './modules/enterPage.js';
import { getAnchorElement } from './modules/getAnchorElement.js';
import { getAnimationPromises } from './modules/getAnimationPromises.js';
import { fetchPage } from './modules/fetchPage.js';
import { leavePage } from './modules/leavePage.js';
import { loadPage, performPageLoad } from './modules/loadPage.js';
import { replaceContent } from './modules/replaceContent.js';
import {
	Events,
	EventArgument,
	EventName,
	EventOptions,
	Handler,
	HandlersProxy
} from './modules/events.js';
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
	// event registry
	events: Events;
	// event handler proxy for backwards compatibility
	_handlers: HandlersProxy;
	// variable for keeping event listeners from "delegate"
	delegatedListeners: DelegatedListeners = {};
	// allows us to compare the current and new path inside popStateHandler
	currentPageUrl = getCurrentUrl();

	loadPage = loadPage;
	performPageLoad = performPageLoad;
	leavePage = leavePage;
	renderPage = renderPage;
	replaceContent = replaceContent;
	enterPage = enterPage;
	delegateEvent = delegateEvent;
	updateTransition = updateTransition;
	shouldSkipTransition = shouldSkipTransition;
	getAnimationPromises = getAnimationPromises;
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

		this.linkClickHandler = this.linkClickHandler.bind(this);
		this.popStateHandler = this.popStateHandler.bind(this);

		this.cache = new Cache(this);
		this.events = new Events(this);
		this._handlers = new HandlersProxy(this.events);

		if (!this.checkRequirements()) {
			return;
		}

		this.enable();
	}

	checkRequirements() {
		if (typeof Promise === 'undefined') {
			console.warn('Promise is not supported');
			return false;
		}
		return true;
	}

	async enable() {
		// Add event listeners
		const { linkSelector } = this.options;
		this.delegatedListeners.click = delegateEvent(linkSelector, 'click', this.linkClickHandler);

		window.addEventListener('popstate', this.popStateHandler);

		// Initial save to cache
		if (this.options.cache) {
			// Disabled to avoid caching modified dom state: logic moved to preload plugin
			// https://github.com/swup/swup/issues/475
		}

		// Mount plugins
		this.options.plugins.forEach((plugin) => this.use(plugin));

		// Modify initial history record
		updateHistoryRecord();

		// Trigger enabled event
		await this.events.trigger('enabled', undefined, () => {
			// Add swup-enabled class to html tag
			document.documentElement.classList.add('swup-enabled');
		});

		// Trigger page view event
		this.events.trigger('pageView');
	}

	async destroy() {
		// remove delegated listeners
		this.delegatedListeners.click!.destroy();

		// remove popstate listener
		window.removeEventListener('popstate', this.popStateHandler);

		// empty cache
		this.cache.empty();

		// unmount plugins
		this.options.plugins.forEach((plugin) => this.unuse(plugin));

		// remove swup data atributes from blocks
		queryAll('[data-swup]').forEach((element) => {
			element.removeAttribute('data-swup');
		});

		// trigger disable event
		await this.events.trigger('disabled', undefined, () => {
			// remove swup-enabled class from html tag
			document.documentElement.classList.remove('swup-enabled');
		});

		// remove handlers
		this.events.clear();
	}

	/**
	 * Alias function to add a new event handler.
	 */
	on<TEvent extends EventName>(
		event: TEvent,
		handler: Handler<TEvent>,
		options: EventOptions = {}
	) {
		return this.events.on(event, handler, options);
	}

	/**
	 * Alias function to add a new event handler to run once.
	 */
	once<TEvent extends EventName>(
		event: TEvent,
		handler: Handler<TEvent>,
		options: EventOptions = {}
	) {
		return this.events.once(event, handler, options);
	}

	/**
	 * Alias function to remove event handlers.
	 */
	off<TEvent extends EventName>(event?: TEvent, handler?: Handler<TEvent>) {
		if (event) {
			return this.events.off(event, handler);
		} else {
			return this.events.clear();
		}
	}

	/**
	 * Alias function to call all event handlers.
	 */
	triggerEvent<TEvent extends EventName>(eventName: TEvent, data?: EventArgument<TEvent>) {
		return this.events.trigger(eventName, data);
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

	linkClickHandler(event: DelegateEvent<MouseEvent>) {
		const linkEl = event.delegateTarget;
		const { href, url, hash } = Location.fromElement(linkEl as HTMLAnchorElement);

		// Exit early if the link should be ignored
		if (this.shouldIgnoreVisit(href, { el: linkEl, event })) {
			return;
		}

		// Exit early if control key pressed
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			this.events.trigger('openPageInNewTab', event);
			return;
		}

		// Exit early if other than left mouse button
		if (event.button !== 0) {
			return;
		}

		this.events.triggerSync('clickLink', event, () => {
			event.preventDefault();

			// Handle links to the same page and exit early, where applicable
			if (!url || url === getCurrentUrl()) {
				this.handleLinkToSamePage(url, hash, event);
				return;
			}

			// Exit early if the resolved path hasn't changed
			if (this.isSameResolvedUrl(url, getCurrentUrl())) {
				return;
			}

			// Store the element that should be scrolled to after loading the next page
			this.scrollToElement = hash || null;

			// Get the custom transition name, if present
			const customTransition = linkEl.getAttribute('data-swup-transition') || undefined;

			// Finally, proceed with loading the page
			this.performPageLoad({ url, customTransition });
		});
	}

	async handleLinkToSamePage(url: string, hash: string, event: DelegateEvent<MouseEvent>) {
		if (hash) {
			await this.events.trigger('samePageWithHash', event, () => {
				updateHistoryRecord(url + hash);
			});
		} else {
			await this.events.trigger('samePage', event);
		}
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

		this.events.triggerSync('popState', event, () => {
			if (!this.options.animateHistoryBrowsing) {
				document.documentElement.classList.remove('is-animating');
				cleanupAnimationClasses();
			}
			this.performPageLoad({ url, event });
		});
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
