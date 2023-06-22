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
import { HistoryAction, loadPage, performPageLoad } from './modules/loadPage.js';
import { replaceContent } from './modules/replaceContent.js';
import { Handler, HookName, Hooks } from './modules/Hooks.js';
import { use, unuse, findPlugin, Plugin } from './modules/plugins.js';
import { renderPage } from './modules/renderPage.js';

import { queryAll } from './utils.js';
import { Context, createContext } from './modules/Context.js';

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
	// context data
	context: Context;
	// variable for current transition info object
	transition: Transition = {};
	// cache instance
	cache: Cache;
	// hook registry
	hooks: Hooks;
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
	getAnimationPromises = getAnimationPromises;
	fetchPage = fetchPage;
	getAnchorElement = getAnchorElement;
	log: (message: string, context?: any) => void = () => {}; // here so it can be used by plugins
	use = use;
	unuse = unuse;
	findPlugin = findPlugin;
	getCurrentUrl = getCurrentUrl;
	cleanupAnimationClasses = cleanupAnimationClasses;
	createContext = createContext;

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
		this.hooks = new Hooks(this);
		this.context = createContext();

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
		await this.hooks.trigger('enabled', undefined, (ctx) => {
			// Add swup-enabled class to html tag
			document.documentElement.classList.add('swup-enabled');
		});

		// Trigger page view event
		this.hooks.trigger('pageView');
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
		await this.hooks.trigger('disabled', undefined, () => {
			// remove swup-enabled class from html tag
			document.documentElement.classList.remove('swup-enabled');
		});

		// remove handlers
		this.hooks.clear();
	}

	/**
	 * Add a new hook handler.
	 * @deprecated Use `swup.hooks.on()` instead.
	 */
	on<T extends HookName>(hook: T, handler: Handler<T>) {
		console.warn(
			'[swup] Methods `swup.on()` and `swup.off()` are deprecated and will be removed in the next major release. Use `swup.hooks.on()` instead.'
		);
		return this.hooks.on(hook, handler);
	}

	/**
	 * Remove a hook handler (or all handlers).
	 * @deprecated Use `swup.hooks.off()` instead.
	 */
	off<T extends HookName>(hook?: T, handler?: Handler<T>): void {
		console.warn(
			'[swup] Methods `swup.on()` and `swup.off()` are deprecated and will be removed in the next major release. Use `swup.hooks.on()` instead.'
		);
		if (hook && handler) {
			return this.hooks.off(hook, handler);
		} else if (hook) {
			return this.hooks.off(hook);
		} else {
			return this.hooks.clear();
		}
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
		const el = event.delegateTarget as HTMLAnchorElement;
		const { href, url, hash } = Location.fromElement(el);

		// Get the transition name, if specified
		const transition = el.getAttribute('data-swup-transition') || undefined;

		// Get the history action, if specified
		let history: HistoryAction | undefined;
		const historyAttr = el.getAttribute('data-swup-history');
		if (historyAttr && ['push', 'replace'].includes(historyAttr)) {
			history = historyAttr as HistoryAction;
		}

		// Exit early if the link should be ignored
		if (this.shouldIgnoreVisit(href, { el, event })) {
			return;
		}

		this.context = this.createContext({ to: url, hash, transition, el, event });

		// Exit early if control key pressed
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			this.hooks.trigger('openPageInNewTab');
			return;
		}

		// Exit early if other than left mouse button
		if (event.button !== 0) {
			return;
		}

		this.hooks.triggerSync('clickLink', { event }, () => {
			event.preventDefault();

			const from = this.context.from?.url;

			// Handle links to the same page and exit early, where applicable
			if (!url || url === from) {
				this.handleLinkToSamePage(url, hash);
				return;
			}

			// Exit early if the resolved path hasn't changed
			if (this.isSameResolvedUrl(url, from ?? '')) {
				return;
			}

			// Finally, proceed with loading the page
			this.performPageLoad(url, { transition, history });
		});
	}

	async handleLinkToSamePage(url: string, hash: string) {
		if (hash) {
			await this.hooks.trigger('samePageWithHash', undefined, () => {
				updateHistoryRecord(url + hash);
			});
		} else {
			await this.hooks.trigger('samePage');
		}
	}

	triggerWillOpenNewWindow(triggerEl: Element) {
		if (triggerEl.matches('[download], [target="_blank"]')) {
			return true;
		}
		return false;
	}

	popStateHandler(event: PopStateEvent) {
		const href = event.state?.url ?? location.href;

		// Exit early if this event should be ignored
		if (this.options.skipPopStateHandling(event)) {
			return;
		}

		// Exit early if the resolved path hasn't changed
		if (this.isSameResolvedUrl(getCurrentUrl(), this.currentPageUrl)) {
			return;
		}

		// Exit early if the link should be ignored
		if (this.shouldIgnoreVisit(href, { event })) {
			return;
		}

		const { url, hash } = Location.fromUrl(href);
		const animate = this.options.animateHistoryBrowsing;
		this.context = this.createContext({ to: url, hash, event, animate, history: true });

		// What does this do?
		if (!hash) {
			event.preventDefault();
		}

		this.hooks.triggerSync('popState', undefined, () => {
			this.performPageLoad(url);
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
