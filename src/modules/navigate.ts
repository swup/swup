import type Swup from '../Swup.js';
import { createHistoryRecord, updateHistoryRecord, getCurrentUrl, Location } from '../helpers.js';
import { FetchError, type FetchOptions, type PageData } from './fetchPage.js';
import type { VisitInitOptions } from './Visit.js';

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
		window.location.href = url;
		return;
	}

	const { url: to, hash } = Location.fromUrl(url);
	this.visit = this.createVisit({ ...init, to, hash });
	this.performNavigation(options);
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
	options: NavigationOptions & FetchOptions = {}
): Promise<void> {
	this.navigating = true;
	// Save this localy to a) allow ignoring the visit if a new one was started in the meantime
	// and b) avoid unintended modifications to any newer visits
	const visit = this.visit;

	const { el } = visit.trigger;
	options.referrer = options.referrer || this.currentPageUrl;

	if (options.animate === false) {
		visit.animation.animate = false;
	}

	// Clean up old animation classes
	if (!visit.animation.animate) {
		this.classes.clear();
	}

	// Get history action from option or attribute on trigger element
	const history = options.history || el?.getAttribute('data-swup-history') || undefined;
	if (history && ['push', 'replace'].includes(history)) {
		visit.history.action = history as HistoryAction;
	}

	// Get custom animation name from option or attribute on trigger element
	const animation = options.animation || el?.getAttribute('data-swup-animation') || undefined;
	if (animation) {
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
		await this.hooks.call('visit:start', undefined);

		// Begin loading page
		const pagePromise = this.hooks.call('page:load', { options }, async (visit, args) => {
			// Read from cache
			let cachedPage: PageData | undefined;
			if (visit.cache.read) {
				cachedPage = this.cache.get(visit.to.url);
			}

			args.page = cachedPage || (await this.fetchPage(visit.to.url, args.options));
			args.cache = !!cachedPage;

			return args.page;
		});

		// Create/update history record if this is not a popstate call or leads to the same URL
		if (!visit.history.popstate) {
			// Add the hash directly from the trigger element
			const newUrl = visit.to.url + visit.to.hash;
			if (visit.history.action === 'replace' || visit.to.url === this.currentPageUrl) {
				updateHistoryRecord(newUrl);
			} else {
				this.currentHistoryIndex++;
				createHistoryRecord(newUrl, { index: this.currentHistoryIndex });
			}
		}

		this.currentPageUrl = getCurrentUrl();

		// Wait for page before starting to animate out?
		if (visit.animation.wait) {
			const { html } = await pagePromise;
			visit.to.html = html;
		}

		// perform the actual transition: animate and replace content
		await this.hooks.call('visit:transition', undefined, async (visit) => {
			// Start leave animation
			const animationPromise = this.animatePageOut();

			// Wait for page to load and leave animation to finish
			const [page] = await Promise.all([pagePromise, animationPromise]);

			// Abort if another visit was started in the meantime
			if (visit.id !== this.visit.id) {
				return false;
			}

			// Render page: replace content and scroll to top/fragment
			await this.renderPage(page);

			// Wait for enter animation
			await this.animatePageIn();

			return true;
		});

		// Finalize visit
		await this.hooks.call('visit:end', undefined, () => this.classes.clear());

		// Reset visit info after finish?
		// if (visit.to && this.isSameResolvedUrl(visit.to.url, requestedUrl)) {
		// 	this.visit = this.createVisit({ to: undefined });
		// }
		this.navigating = false;
	} catch (error) {
		// Return early if error is undefined or signals an aborted request
		if (!error || (error as FetchError)?.aborted) {
			return;
		}

		// Log to console as we swallow almost all hook errors
		console.error(error);

		// Rewrite `skipPopStateHandling` to redirect manually when `history.go` is processed
		this.options.skipPopStateHandling = () => {
			window.location.href = visit.to.url + visit.to.hash;
			return true;
		};

		// Go back to the actual page we're still at
		window.history.go(-1);
	}
}
