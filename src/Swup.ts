import { type DelegateEvent } from 'delegate-it';

import version from './config/version.js';

import { delegateEvent, getCurrentUrl, Location, updateHistoryRecord } from './helpers.js';
import { type DelegateEventUnsubscribe } from './helpers/delegateEvent.js';

import { Cache } from './modules/Cache.js';
import { Classes } from './modules/Classes.js';
import { type Visit, createVisit } from './modules/Visit.js';
import { Hooks, type HookName, type HookInitOptions } from './modules/Hooks.js';
import { getAnchorElement } from './modules/getAnchorElement.js';
import { awaitAnimations } from './modules/awaitAnimations.js';
import { navigate, performNavigation, type NavigationToSelfAction } from './modules/navigate.js';
import { fetchPage } from './modules/fetchPage.js';
import { animatePageOut } from './modules/animatePageOut.js';
import { replaceContent } from './modules/replaceContent.js';
import { scrollToContent } from './modules/scrollToContent.js';
import { animatePageIn } from './modules/animatePageIn.js';
import { renderPage } from './modules/renderPage.js';
import { use, unuse, findPlugin, type Plugin } from './modules/plugins.js';
import { isSameResolvedUrl, resolveUrl } from './modules/resolveUrl.js';
import { nextTick } from './utils.js';
import { type HistoryState } from './helpers/history.js';

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
	/** How swup handles links to the same page. Default: `scroll` */
	linkToSelf: NavigationToSelfAction;
	/** Enable native animations using the View Transitions API. */
	native: boolean;
	/** Hook handlers to register. */
	hooks: Partial<HookInitOptions>;
	/** Plugins to register on startup. */
	plugins: Plugin[];
	/** Custom headers sent along with fetch requests. */
	requestHeaders: Record<string, string>;
	/** Rewrite URLs before loading them. */
	resolveUrl: (url: string) => string;
	/** Callback for telling swup to ignore certain popstate events.  */
	skipPopStateHandling: (event: PopStateEvent) => boolean;
	/** Request timeout in milliseconds. */
	timeout: number;
};

const defaults: Options = {
	animateHistoryBrowsing: false,
	animationSelector: '[class*="transition-"]',
	animationScope: 'html',
	cache: true,
	containers: ['#swup'],
	hooks: {},
	ignoreVisit: (url, { el } = {}) => !!el?.closest('[data-no-swup]'),
	linkSelector: 'a[href]',
	linkToSelf: 'scroll',
	native: false,
	plugins: [],
	resolveUrl: (url) => url,
	requestHeaders: {
		'X-Requested-With': 'swup',
		'Accept': 'text/html, application/xhtml+xml'
	},
	skipPopStateHandling: (event) => (event.state as HistoryState)?.source !== 'swup',
	timeout: 0
};

/** Swup page transition library. */
export default class Swup {
	/** Library version */
	readonly version: string = version;
	/** Options passed into the instance */
	options: Options;
	/** Default options before merging user options */
	readonly defaults: Options = defaults;
	/** Registered plugin instances */
	plugins: Plugin[] = [];
	/** Data about the current visit */
	visit: Visit;
	/** Cache instance */
	readonly cache: Cache;
	/** Hook registry */
	readonly hooks: Hooks;
	/** Animation class manager */
	readonly classes: Classes;
	/** Location of the currently visible page */
	location: Location = Location.fromUrl(window.location.href);
	/** URL of the currently visible page @deprecated Use swup.location.url instead */
	get currentPageUrl(): string {
		return this.location.url;
	}
	/** Index of the current history entry */
	protected currentHistoryIndex: number;
	/** Delegated event subscription handle */
	protected clickDelegate?: DelegateEventUnsubscribe;
	/** Navigation status */
	protected navigating: boolean = false;
	/** Run anytime a visit ends */
	protected onVisitEnd?: () => Promise<unknown>;

	/** Install a plugin */
	use = use;
	/** Uninstall a plugin */
	unuse = unuse;
	/** Find a plugin by name or instance */
	findPlugin = findPlugin;

	/** Log a message. Has no effect unless debug plugin is installed */
	log: (message: string, context?: unknown) => void = () => {};

	/** Navigate to a new URL */
	navigate = navigate;
	/** Actually perform a navigation */
	protected performNavigation = performNavigation;
	/** Create a new context for this visit */
	protected createVisit = createVisit;
	/** Register a delegated event listener */
	delegateEvent = delegateEvent;
	/** Fetch a page from the server */
	fetchPage = fetchPage;
	/** Resolve when animations on the page finish */
	awaitAnimations = awaitAnimations;
	protected renderPage = renderPage;
	/** Replace the content after page load */
	replaceContent = replaceContent;
	protected animatePageIn = animatePageIn;
	protected animatePageOut = animatePageOut;
	protected scrollToContent = scrollToContent;
	/** Find the anchor element for a given hash */
	getAnchorElement = getAnchorElement;

	/** Get the current page URL */
	getCurrentUrl = getCurrentUrl;
	/** Resolve a URL to its final location */
	resolveUrl = resolveUrl;
	/** Check if two URLs resolve to the same location */
	protected isSameResolvedUrl = isSameResolvedUrl;

	constructor(options: Partial<Options> = {}) {
		// Merge defaults and options
		this.options = { ...this.defaults, ...options };

		this.handleLinkClick = this.handleLinkClick.bind(this);
		this.handlePopState = this.handlePopState.bind(this);

		this.cache = new Cache(this);
		this.classes = new Classes(this);
		this.hooks = new Hooks(this);
		this.visit = this.createVisit({ to: '' });

		this.currentHistoryIndex = (window.history.state as HistoryState)?.index ?? 1;

		this.enable();
	}

	/** Enable this instance, adding listeners and classnames. */
	async enable() {
		// Add event listener
		const { linkSelector } = this.options;
		this.clickDelegate = this.delegateEvent(linkSelector, 'click', this.handleLinkClick);

		window.addEventListener('popstate', this.handlePopState);

		// Set scroll restoration to manual if animating history visits
		if (this.options.animateHistoryBrowsing) {
			window.history.scrollRestoration = 'manual';
		}

		// Initial save to cache
		if (this.options.cache) {
			// Disabled to avoid caching modified dom state: logic moved to preload plugin
			// https://github.com/swup/swup/issues/475
		}

		// Sanitize/check native option
		this.options.native = this.options.native && !!document.startViewTransition;

		// Mount plugins
		this.options.plugins.forEach((plugin) => this.use(plugin));

		// Install user hooks
		for (const [key, handler] of Object.entries(this.options.hooks)) {
			// Build hook options from modifier suffix: 'content:replace.before' => { before: true }
			const [hook, modifiers] = this.hooks.parseName(key as HookName);
			// @ts-expect-error: object.entries() does not preserve key/value types
			this.hooks.on(hook, handler, modifiers);
		}

		// Create initial history record
		if ((window.history.state as HistoryState)?.source !== 'swup') {
			updateHistoryRecord(null, { index: this.currentHistoryIndex });
		}

		// Give consumers a chance to hook into enable
		await nextTick();

		// Trigger enable hook
		await this.hooks.call('enable', undefined, undefined, () => {
			const html = document.documentElement;
			html.classList.add('swup-enabled');
			html.classList.toggle('swup-native', this.options.native);
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
		await this.hooks.call('disable', undefined, undefined, () => {
			const html = document.documentElement;
			html.classList.remove('swup-enabled');
			html.classList.remove('swup-native');
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

		// Ignore if swup is currently navigating towards the link's URL
		if (this.navigating && url === this.visit.to.url) {
			event.preventDefault();
			return;
		}

		const visit = this.createVisit({ to: url, hash, el, event });

		// Exit early if control key pressed
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			this.hooks.callSync('link:newtab', visit, { href });
			return;
		}

		// Exit early if other than left mouse button
		if (event.button !== 0) {
			return;
		}

		this.hooks.callSync('link:click', visit, { el, event }, () => {
			const from = visit.from.url ?? '';

			event.preventDefault();

			// Handle links to the same page
			if (!url || url === from) {
				if (hash) {
					// With hash: scroll to anchor
					this.hooks.callSync('link:anchor', visit, { hash }, () => {
						updateHistoryRecord(url + hash);
						this.scrollToContent(visit);
					});
				} else {
					// Without hash: scroll to top or load/reload page
					this.hooks.callSync('link:self', visit, undefined, () => {
						if (this.options.linkToSelf === 'navigate') {
							this.performNavigation(visit);
						} else {
							updateHistoryRecord(url);
							this.scrollToContent(visit);
						}
					});
				}
				return;
			}

			// Exit early if the resolved path hasn't changed
			if (this.isSameResolvedUrl(url, from)) {
				return;
			}

			// Finally, proceed with loading the page
			this.performNavigation(visit);
		});
	}

	protected handlePopState(event: PopStateEvent) {
		const href: string = (event.state as HistoryState)?.url ?? window.location.href;

		// Exit early if this event should be ignored
		if (this.options.skipPopStateHandling(event)) {
			return;
		}

		// Exit early if the resolved path hasn't changed
		if (this.isSameResolvedUrl(getCurrentUrl(), this.location.url)) {
			return;
		}

		const { url, hash } = Location.fromUrl(href);

		const visit = this.createVisit({ to: url, hash, event });

		// Mark as history visit
		visit.history.popstate = true;

		// Determine direction of history visit
		const index = (event.state as HistoryState)?.index ?? 0;
		if (index && index !== this.currentHistoryIndex) {
			const direction = index - this.currentHistoryIndex > 0 ? 'forwards' : 'backwards';
			visit.history.direction = direction;
			this.currentHistoryIndex = index;
		}

		// Disable animation & scrolling for history visits
		visit.animation.animate = false;
		visit.scroll.reset = false;
		visit.scroll.target = false;

		// Animated history visit: re-enable animation & scroll reset
		if (this.options.animateHistoryBrowsing) {
			visit.animation.animate = true;
			visit.scroll.reset = true;
		}

		this.hooks.callSync('history:popstate', visit, { event }, () => {
			this.performNavigation(visit);
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
