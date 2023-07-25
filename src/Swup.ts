import { DelegateEvent } from 'delegate-it';

import version from './config/version.js';

import { delegateEvent, getCurrentUrl, Location, updateHistoryRecord } from './helpers.js';
import { DelegateEventUnsubscribe } from './helpers/delegateEvent.js';

import { Cache } from './modules/Cache.js';
import { Classes } from './modules/Classes.js';
import { Visit, createVisit } from './modules/Visit.js';
import { Hooks } from './modules/Hooks.js';
import { getAnchorElement } from './modules/getAnchorElement.js';
import { awaitAnimations } from './modules/awaitAnimations.js';
import { navigate, performNavigation } from './modules/navigate.js';
import { fetchPage } from './modules/fetchPage.js';
import { animatePageOut } from './modules/animatePageOut.js';
import { replaceContent } from './modules/replaceContent.js';
import { scrollToContent } from './modules/scrollToContent.js';
import { animatePageIn } from './modules/animatePageIn.js';
import { renderPage } from './modules/renderPage.js';
import { use, unuse, findPlugin, Plugin } from './modules/plugins.js';
import { isSameResolvedUrl, resolveUrl } from './modules/resolveUrl.js';
import { nextTick } from './utils.js';

/** Options for customizing swup's behavior. */
export type Options = {
	/** Whether history visits are animated. Default: `false` */
	animateHistoryBrowsing: boolean;
	/** Selector for detecting animation timing. Default: `[class*="transition-"]` */
	animationSelector: string | false;
	/** Elements on which to add animation classes. Default: `html` element */
	animationScope: 'html' | 'containers';
	/** Enable in-memory page cache. Default: `true` */
	cache: boolean;
	/** Content containers to be replaced on page visits. Default: `['#swup']` */
	containers: string[];
	/** Callback for ignoring visits. Receives the element and event that triggered the visit. */
	ignoreVisit: (url: string, { el, event }: { el?: Element; event?: Event }) => boolean;
	/** Selector for links that trigger visits. Default: `'a[href]'` */
	linkSelector: string;
	/** Plugins to register on startup. */
	plugins: Plugin[];
	/** Custom headers sent along with fetch requests. */
	requestHeaders: Record<string, string>;
	/** Rewrite URLs before loading them. */
	resolveUrl: (url: string) => string;
	/** Callback for telling swup to ignore certain popstate events.  */
	skipPopStateHandling: (event: any) => boolean;
};

/** Swup page transition library. */
export default class Swup {
	/** Library version */
	version: string = version;
	/** Options passed into the instance */
	options: Options;
	/** Registered plugin instances */
	plugins: Plugin[] = [];
	/** Data about the current visit */
	visit: Visit;
	/** Cache instance */
	cache: Cache;
	/** Hook registry */
	hooks: Hooks;
	/** Animation class manager */
	classes: Classes;
	/** URL of the currently visible page */
	currentPageUrl = getCurrentUrl();
	/** Index of the current history entry */
	currentHistoryIndex = 1;
	/** Delegated event subscription handle */
	private clickDelegate?: DelegateEventUnsubscribe;

	navigate = navigate;
	performNavigation = performNavigation;
	animatePageOut = animatePageOut;
	renderPage = renderPage;
	replaceContent = replaceContent;
	scrollToContent = scrollToContent;
	animatePageIn = animatePageIn;
	delegateEvent = delegateEvent;
	fetchPage = fetchPage;
	awaitAnimations = awaitAnimations;
	getAnchorElement = getAnchorElement;
	use = use;
	unuse = unuse;
	findPlugin = findPlugin;
	getCurrentUrl = getCurrentUrl;
	createVisit = createVisit;
	log: (message: string, context?: any) => void = () => {}; // here so it can be used by plugins

	/** Default options before merging user options */
	defaults: Options = {
	resolveUrl = resolveUrl;
	protected isSameResolvedUrl = isSameResolvedUrl;
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
			'Accept': 'text/html, application/xhtml+xml'
		},
		skipPopStateHandling: (event) => event.state?.source !== 'swup'
	};

	constructor(options: Partial<Options> = {}) {
		// Merge defaults and options
		this.options = { ...this.defaults, ...options };

		this.handleLinkClick = this.handleLinkClick.bind(this);
		this.handlePopState = this.handlePopState.bind(this);

		this.cache = new Cache(this);
		this.classes = new Classes(this);
		this.hooks = new Hooks(this);
		this.visit = this.createVisit({ to: undefined });

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

	/** Enable this instance, adding listeners and classnames. */
	async enable() {
		// Add event listener
		const { linkSelector } = this.options;
		this.clickDelegate = this.delegateEvent(linkSelector, 'click', this.handleLinkClick);

		window.addEventListener('popstate', this.handlePopState);

		// Initial save to cache
		if (this.options.cache) {
			// Disabled to avoid caching modified dom state: logic moved to preload plugin
			// https://github.com/swup/swup/issues/475
		}

		// Mount plugins
		this.options.plugins.forEach((plugin) => this.use(plugin));

		// Modify initial history record
		updateHistoryRecord(null, { index: 1 });

		// Give consumers a chance to hook into enable
		await nextTick();

		// Trigger enable hook
		await this.hooks.call('enable', undefined, () => {
			// Add swup-enabled class to html tag
			document.documentElement.classList.add('swup-enabled');
		});
	}

	/** Disable this instance, removing listeners and classnames. */
	async destroy() {
		// remove delegated listener
		this.clickDelegate!.destroy();

		// remove popstate listener
		window.removeEventListener('popstate', this.handlePopState);

		// empty cache
		this.cache.clear();

		// unmount plugins
		this.options.plugins.forEach((plugin) => this.unuse(plugin));

		// trigger disable hook
		await this.hooks.call('disable', undefined, () => {
			// remove swup-enabled class from html tag
			document.documentElement.classList.remove('swup-enabled');
		});

		// remove handlers
		this.hooks.clear();
	}

	/** Determine if a visit should be ignored by swup, based on URL or trigger element. */
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

	protected handleLinkClick(event: DelegateEvent<MouseEvent>) {
		const el = event.delegateTarget as HTMLAnchorElement;
		const { href, url, hash } = Location.fromElement(el);

		// Exit early if the link should be ignored
		if (this.shouldIgnoreVisit(href, { el, event })) {
			return;
		}

		this.visit = this.createVisit({ to: url, hash, el, event });

		// Exit early if control key pressed
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			this.hooks.call('link:newtab', { href });
			return;
		}

		// Exit early if other than left mouse button
		if (event.button !== 0) {
			return;
		}

		this.hooks.callSync('link:click', { el, event }, () => {
			const from = this.visit.from.url ?? '';

			event.preventDefault();

			// Handle links to the same page: with or without hash
			if (!url || url === from) {
				if (hash) {
					this.hooks.callSync('link:anchor', { hash }, () => {
						updateHistoryRecord(url + hash);
						this.scrollToContent();
					});
				} else {
					this.hooks.callSync('link:self', undefined, () => {
						this.scrollToContent();
					});
				}
				return;
			}

			// Exit early if the resolved path hasn't changed
			if (this.isSameResolvedUrl(url, from)) {
				return;
			}

			// Finally, proceed with loading the page
			this.performNavigation(url);
		});
	}

	protected handlePopState(event: PopStateEvent) {
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

		this.visit = this.createVisit({
			to: url,
			hash,
			event,
			animate,
			resetScroll
		});

		// Mark as popstate visit
		this.visit.history.popstate = true;

		// Determine direction of history visit
		const index = Number(event.state?.index);
		if (index) {
			const direction = index - this.currentHistoryIndex > 0 ? 'forwards' : 'backwards';
			this.visit.history.direction = direction;
		}

		// Does this even do anything?
		// if (!hash) {
		// 	event.preventDefault();
		// }

		this.hooks.callSync('history:popstate', { event }, () => {
			this.performNavigation(url);
		});
	}

	/** Determine whether an element will open a new tab when clicking/activating. */
	protected triggerWillOpenNewWindow(triggerEl: Element) {
		if (triggerEl.matches('[download], [target="_blank"]')) {
			return true;
		}
		return false;
	}
}
