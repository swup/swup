import { DelegateEvent } from 'delegate-it';

import version from './config/version.js';

import { delegateEvent, getCurrentUrl, Location, updateHistoryRecord } from './helpers.js';
import { Unsubscribe } from './helpers/delegateEvent.js';

import { Cache } from './modules/Cache.js';
import { Classes } from './modules/Classes.js';
import { Context, createContext } from './modules/Context.js';
import { Hooks } from './modules/Hooks.js';
import { getAnchorElement } from './modules/getAnchorElement.js';
import { getAnimationPromises } from './modules/getAnimationPromises.js';
import { loadPage } from './modules/loadPage.js';
import { fetchPage } from './modules/fetchPage.js';
import { leavePage } from './modules/leavePage.js';
import { replaceContent } from './modules/replaceContent.js';
import { enterPage } from './modules/enterPage.js';
import { renderPage } from './modules/renderPage.js';
import { performPageLoad, HistoryAction } from './modules/loadPage.js';
import { use, unuse, findPlugin, Plugin } from './modules/plugins.js';

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
	animationScope: 'html' | 'containers';
	cache: boolean;
	containers: string[];
	ignoreVisit: (url: string, { el, event }: { el?: Element; event?: Event }) => boolean;
	linkSelector: string;
	plugins: Plugin[];
	requestHeaders: Record<string, string>;
	resolveUrl: (url: string) => string;
	skipPopStateHandling: (event: any) => boolean;
};

export default class Swup {
	version: string = version;
	// variable for save options
	options: Options;
	// running plugin instances
	plugins: Plugin[] = [];
	// context data
	context: Context;
	// cache instance
	cache: Cache;
	// hook registry
	hooks: Hooks;
	// classname manager
	classes: Classes;
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
	createContext = createContext;

	defaults: Options = {
		animateHistoryBrowsing: false,
		animationSelector: '[class*="transition-"]',
		animationScope: 'html',
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
		this.classes = new Classes(this);
		this.hooks = new Hooks(this);
		this.context = this.createContext({ to: undefined });

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
		await this.hooks.trigger('enabled', undefined, () => {
			// Add swup-enabled class to html tag
			document.documentElement.classList.add('swup-enabled');
		});

		// Trigger page view event
		await this.hooks.trigger('pageView', { url: this.currentPageUrl, title: document.title });
	}

	async destroy() {
		// remove delegated listeners
		this.delegatedListeners.click!.destroy();

		// remove popstate listener
		window.removeEventListener('popstate', this.popStateHandler);

		// empty cache
		this.cache.clear();

		// unmount plugins
		this.options.plugins.forEach((plugin) => this.unuse(plugin));

		// trigger disable event
		await this.hooks.trigger('disabled', undefined, () => {
			// remove swup-enabled class from html tag
			document.documentElement.classList.remove('swup-enabled');
		});

		// remove handlers
		this.hooks.clear();
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
		let historyAction: HistoryAction | undefined;
		const historyAttr = el.getAttribute('data-swup-history');
		if (historyAttr && ['push', 'replace'].includes(historyAttr)) {
			historyAction = historyAttr as HistoryAction;
		}

		// Exit early if the link should be ignored
		if (this.shouldIgnoreVisit(href, { el, event })) {
			return;
		}

		this.context = this.createContext({
			to: url,
			hash,
			transition,
			el,
			event,
			action: historyAction
		});

		// Exit early if control key pressed
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			this.hooks.trigger('openPageInNewTab', { href });
			return;
		}

		// Exit early if other than left mouse button
		if (event.button !== 0) {
			return;
		}

		this.hooks.triggerSync('clickLink', { el, event }, () => {
			const from = this.context.from?.url ?? '';

			event.preventDefault();

			// Handle links to the same page: with or without hash
			if (!url || url === from) {
				if (hash) {
					updateHistoryRecord(url + hash);
					this.hooks.triggerSync(
						'samePageWithHash',
						{ hash, options: { behavior: 'auto' } },
						(context, { hash, options }) => {
							const target = this.getAnchorElement(hash);
							if (target) {
								target.scrollIntoView(options);
							}
						}
					);
				} else {
					this.hooks.triggerSync('samePage', undefined, (context) => {
						if (!context.scroll.reset) return;
						window.scroll({ top: 0, left: 0, behavior: 'auto' });
					});
				}
				return;
			}

			// Exit early if the resolved path hasn't changed
			if (this.isSameResolvedUrl(url, from)) {
				return;
			}

			// Finally, proceed with loading the page
			this.performPageLoad(url, { transition, history: historyAction });
		});
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
		const resetScroll = this.options.animateHistoryBrowsing;
		this.context = this.createContext({
			to: url,
			hash,
			event,
			animate,
			resetScroll,
			popstate: true
		});

		// Does this even do anything?
		// if (!hash) {
		// 	event.preventDefault();
		// }

		this.hooks.triggerSync('popState', { event }, () => {
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
