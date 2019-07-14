import delegate from 'delegate';

// modules
import Cache from './modules/Cache';
import loadPage from './modules/loadPage';
import renderPage from './modules/renderPage';
import triggerEvent from './modules/triggerEvent';
import on from './modules/on';
import off from './modules/off';
import updateTransition from './modules/updateTransition';
import getAnimationPromises from './modules/getAnimationPromises';
import getPageData from './modules/getPageData';
import { use, unuse, findPlugin } from './modules/plugins';

import { queryAll } from './utils';
import { getDataFromHtml, getCurrentUrl, markSwupElements, Link } from './helpers';

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
			}
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

		// variable for id of element to scroll to after render
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

		// make modules accessible in instance
		this.cache = new Cache();
		this.cache.swup = this;
		this.loadPage = loadPage;
		this.renderPage = renderPage;
		this.triggerEvent = triggerEvent;
		this.on = on;
		this.off = off;
		this.updateTransition = updateTransition;
		this.getAnimationPromises = getAnimationPromises;
		this.getPageData = getPageData;
		this.log = () => {}; // here so it can be used by plugins
		this.use = use;
		this.unuse = unuse;
		this.findPlugin = findPlugin;

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
		window.addEventListener('popstate', this.popStateHandler.bind(this));

		// initial save to cache
		let page = getDataFromHtml(document.documentElement.outerHTML, this.options.containers);
		page.url = page.responseURL = getCurrentUrl();
		if (this.options.cache) {
			this.cache.cacheUrl(page);
		}

		// mark swup blocks in html
		markSwupElements(document.documentElement, this.options.containers);

		// mount plugins
		this.options.plugins.forEach((plugin) => {
			this.use(plugin);
		});

		// modify initial history record
		window.history.replaceState(
			Object.assign({}, window.history.state, {
				url: window.location.href,
				random: Math.random(),
				source: 'swup'
			}),
			document.title,
			window.location.href
		);

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
		this.delegatedListeners.mouseover.destroy();

		// remove popstate listener
		window.removeEventListener('popstate', this.popStateHandler.bind(this));

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
		// no control key pressed
		if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
			// index of pressed button needs to be checked because Firefox triggers click on all mouse buttons
			if (event.button === 0) {
				this.triggerEvent('clickLink', event);
				event.preventDefault();
				const link = new Link(event.delegateTarget);
				if (link.getAddress() == getCurrentUrl() || link.getAddress() == '') {
					// link to the same URL
					if (link.getHash() != '') {
						// link to the same URL with hash
						this.triggerEvent('samePageWithHash', event);
						const element = document.querySelector(link.getHash());
						if (element != null) {
							history.replaceState(
								{
									url: link.getAddress() + link.getHash(),
									random: Math.random(),
									source: 'swup'
								},
								document.title,
								link.getAddress() + link.getHash()
							);
						} else {
							// referenced element not found
							console.warn(`Element for offset not found (${link.getHash()})`);
						}
					} else {
						// link to the same URL without hash
						this.triggerEvent('samePage', event);
					}
				} else {
					// link to different url
					if (link.getHash() != '') {
						this.scrollToElement = link.getHash();
					}

					// get custom transition from data
					let customTransition = event.delegateTarget.getAttribute(
						'data-swup-transition'
					);

					// load page
					this.loadPage(
						{ url: link.getAddress(), customTransition: customTransition },
						false
					);
				}
			}
		} else {
			// open in new tab (do nothing)
			this.triggerEvent('openPageInNewTab', event);
		}
	}

	popStateHandler(event) {
		if (this.options.skipPopStateHandling(event)) return;
		const link = new Link(event.state ? event.state.url : window.location.pathname);
		if (link.getHash() !== '') {
			this.scrollToElement = link.getHash();
		} else {
			event.preventDefault();
		}
		this.triggerEvent('popState', event);
		this.loadPage({ url: link.getAddress() }, event);
	}
}
