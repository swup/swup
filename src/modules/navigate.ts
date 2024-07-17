import type Swup from '../Swup.js';
import { FetchError, type FetchOptions, type PageData } from './fetchPage.js';
import { type VisitInitOptions, type Visit, VisitState } from './Visit.js';
import { createHistoryRecord, updateHistoryRecord, Location, classify } from '../helpers.js';
import { getContextualAttr } from '../utils.js';

export type HistoryAction = 'push' | 'replace';
export type HistoryDirection = 'forwards' | 'backwards';
export type NavigationToSelfAction = 'scroll' | 'navigate';
export type CacheControl = Partial<{ read: boolean; write: boolean }>;

/** Define how to navigate to a page. */
type NavigationOptions = {
	/** Whether this visit is animated. Default: `true` */
	animate?: boolean;
	/** Name of a custom animation to run. */
	animation?: string;
	/** History action to perform: `push` for creating a new history entry, `replace` for replacing the current entry. Default: `push` */
	history?: HistoryAction;
	/** Whether this visit should read from or write to the cache. */
	cache?: CacheControl;
};

/**
 * Navigate to a new URL.
 * @param url The URL to navigate to.
 * @param options Options for how to perform this visit.
 * @returns Promise<void>
 */
export function navigate(
	this: Swup,
	url: string,
	options: NavigationOptions & FetchOptions = {},
	init: Omit<VisitInitOptions, 'to'> = {}
) {
	if (typeof url !== 'string') {
		throw new Error(`swup.navigate() requires a URL parameter`);
	}

	// Check if the visit should be ignored
	if (this.shouldIgnoreVisit(url, { el: init.el, event: init.event })) {
		window.location.assign(url);
		return;
	}

	const { url: to, hash } = Location.fromUrl(url);

	const visit = this.createVisit({ ...init, to, hash });
	this.performNavigation(visit, options);
}

/**
 * Start a visit to a new URL.
 *
 * Internal method that assumes the visit context has already been created.
 *
 * As a user, you should call `swup.navigate(url)` instead.
 *
 * @param url The URL to navigate to.
 * @param options Options for how to perform this visit.
 * @returns Promise<void>
 */
export async function performNavigation(
	this: Swup,
	visit: Visit,
	options: NavigationOptions & FetchOptions = {}
): Promise<void> {
	if (this.navigating) {
		if (this.visit.state >= VisitState.ENTERING) {
			// Currently navigating and content already loaded? Finish and queue
			visit.state = VisitState.QUEUED;
			this.onVisitEnd = () => this.performNavigation(visit, options);
			return;
		} else {
			// Currently navigating and content not loaded? Abort running visit
			await this.hooks.call('visit:abort', this.visit, undefined);
			delete this.visit.to.document;
			this.visit.state = VisitState.ABORTED;
		}
	}

	this.navigating = true;
	this.visit = visit;

	const { el } = visit.trigger;
	options.referrer = options.referrer || this.location.url;

	if (options.animate === false) {
		visit.animation.animate = false;
	}

	// Clean up old animation classes
	if (!visit.animation.animate) {
		this.classes.clear();
	}

	// Get history action from option or attribute on trigger element
	const history = options.history || getContextualAttr(el, 'data-swup-history');
	if (typeof history === 'string' && ['push', 'replace'].includes(history)) {
		visit.history.action = history as HistoryAction;
	}

	// Get custom animation name from option or attribute on trigger element
	const animation = options.animation || getContextualAttr(el, 'data-swup-animation');
	if (typeof animation === 'string') {
		visit.animation.name = animation;
	}

	// Sanitize cache option
	if (typeof options.cache === 'object') {
		visit.cache.read = options.cache.read ?? visit.cache.read;
		visit.cache.write = options.cache.write ?? visit.cache.write;
	} else if (options.cache !== undefined) {
		visit.cache = { read: !!options.cache, write: !!options.cache };
	}
	// Delete this so that window.fetch doesn't mis-interpret it
	delete options.cache;

	try {
		await this.hooks.call('visit:start', visit, undefined);

		visit.state = VisitState.STARTED;

		// Begin loading page
		const page = this.hooks.call('page:load', visit, { options }, async (visit, args) => {
			// Read from cache
			let cachedPage: PageData | undefined;
			if (visit.cache.read) {
				cachedPage = this.cache.get(visit.to.url);
			}

			args.page = cachedPage || (await this.fetchPage(visit.to.url, args.options));
			args.cache = !!cachedPage;

			return args.page;
		});

		/**
		 * When the page is loaded: mark the visit as loaded and save
		 * the raw html and a parsed document of the received page in the visit object
		 */
		page.then(({ html }) => {
			visit.advance(VisitState.LOADED);
			visit.to.html = html;
			visit.to.document = new DOMParser().parseFromString(html, 'text/html');
		});

		// Create/update history record if this is not a popstate call or leads to the same URL
		const newUrl = visit.to.url + visit.to.hash;
		if (!visit.history.popstate) {
			if (visit.history.action === 'replace' || visit.to.url === this.location.url) {
				updateHistoryRecord(newUrl);
			} else {
				this.currentHistoryIndex++;
				createHistoryRecord(newUrl, { index: this.currentHistoryIndex });
			}
		}
		this.location = Location.fromUrl(newUrl);

		// Mark visit type with classes
		if (visit.history.popstate) {
			this.classes.add('is-popstate');
		}
		if (visit.animation.name) {
			this.classes.add(`to-${classify(visit.animation.name)}`);
		}

		// Wait for page before starting to animate out?
		if (visit.animation.wait) {
			await page;
		}

		// Check if failed/aborted in the meantime
		if (visit.done) return;

		// Perform the actual transition: animate and replace content
		await this.hooks.call('visit:transition', visit, undefined, async () => {
			// No animation? Just await page and render
			if (!visit.animation.animate) {
				await this.hooks.call('animation:skip', undefined);
				await this.renderPage(visit, await page);
				return;
			}

			// Animate page out, render page, animate page in
			visit.advance(VisitState.LEAVING);
			await this.animatePageOut(visit);
			if (visit.animation.native && document.startViewTransition) {
				await document.startViewTransition(
					async () => await this.renderPage(visit, await page)
				).finished;
			} else {
				await this.renderPage(visit, await page);
			}
			await this.animatePageIn(visit);
		});

		// Check if failed/aborted in the meantime
		if (visit.done) return;

		// Finalize visit
		await this.hooks.call('visit:end', visit, undefined, () => this.classes.clear());
		visit.state = VisitState.COMPLETED;
		this.navigating = false;

		/** Run eventually queued function */
		if (this.onVisitEnd) {
			this.onVisitEnd();
			this.onVisitEnd = undefined;
		}
	} catch (error) {
		// Return early if error is undefined or signals an aborted request
		if (!error || (error as FetchError)?.aborted) {
			visit.state = VisitState.ABORTED;
			return;
		}

		visit.state = VisitState.FAILED;

		// Log to console
		console.error(error);

		// Remove current history entry, then load requested url in browser
		this.options.skipPopStateHandling = () => {
			window.location.assign(visit.to.url + visit.to.hash);
			return true;
		};

		// Go back to the actual page we're still at
		window.history.back();
	} finally {
		delete visit.to.document;
	}
}
