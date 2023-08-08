import Swup from '../Swup.js';
import { createHistoryRecord, updateHistoryRecord, getCurrentUrl, Location } from '../helpers.js';
import { FetchOptions } from './fetchPage.js';
import { VisitInitOptions } from './Visit.js';

export type HistoryAction = 'push' | 'replace';
export type HistoryDirection = 'forwards' | 'backwards';
export type NavigationToSelfAction = 'scroll' | 'navigate';

/** Define how to navigate to a page. */
type NavigationOptions = {
	/** Whether this visit is animated. Default: `true` */
	animate?: boolean;
	/** Name of a custom animation to run. */
	animation?: string;
	/** History action to perform: `push` for creating a new history entry, `replace` for replacing the current entry. Default: `push` */
	history?: HistoryAction;
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
	// Check if the visit should be ignored
	if (this.shouldIgnoreVisit(url, { el: init.el, event: init.event })) {
		window.location.href = url;
		return;
	}

	const { url: to, hash } = Location.fromUrl(url);
	this.visit = this.createVisit({ ...init, to, hash });
	this.performNavigation(to, options);
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
	url: string,
	options: NavigationOptions & FetchOptions = {}
) {
	if (typeof url !== 'string') {
		throw new Error(`swup.navigate() requires a URL parameter`);
	}

	const { el } = this.visit.trigger;
	this.visit.to.url = Location.fromUrl(url).url;
	options.referrer = options.referrer || this.currentPageUrl;

	if (options.animate === false) {
		this.visit.animation.animate = false;
	}

	// Clean up old animation classes
	if (!this.visit.animation.animate) {
		this.classes.clear();
	}

	// Get history action from option or attribute on trigger element
	const history = options.history || el?.getAttribute('data-swup-history') || undefined;
	if (history && ['push', 'replace'].includes(history)) {
		this.visit.history.action = history as HistoryAction;
	}

	// Get custom animation name from option or attribute on trigger element
	const animation = options.animation || el?.getAttribute('data-swup-animation') || undefined;
	if (animation) {
		this.visit.animation.name = animation;
	}

	try {
		await this.hooks.call('visit:start');

		// Begin loading page
		const pagePromise = this.hooks.call('page:load', { options }, async (visit, args) => {
			const cachedPage = this.cache.get(visit.to.url!);
			args.page = cachedPage || (await this.fetchPage(visit.to.url!, args.options));
			args.cache = !!cachedPage;
			return args.page;
		});

		// Create/update history record if this is not a popstate call or leads to the same URL
		if (!this.visit.history.popstate) {
			// Add the hash directly from the trigger element
			const newUrl = url + (el ? Location.fromElement(el).hash : '');
			if (
				this.visit.history.action === 'replace' ||
				this.visit.to.url === this.currentPageUrl
			) {
				updateHistoryRecord(newUrl);
			} else {
				const index = this.currentHistoryIndex + 1;
				createHistoryRecord(newUrl, { index });
			}
		}

		this.currentPageUrl = getCurrentUrl();

		// Wait for page before starting to animate out?
		if (this.visit.animation.wait) {
			const { html } = await pagePromise;
			this.visit.to.html = html;
		}

		// Wait for page to load and leave animation to finish
		const animationPromise = this.animatePageOut();
		const [page] = await Promise.all([pagePromise, animationPromise]);

		// Render page: replace content and scroll to top/fragment
		await this.renderPage(this.visit.to.url, page);

		// Wait for enter animation
		await this.animatePageIn();

		// Finalize visit
		await this.hooks.call('visit:end', undefined, () => this.classes.clear());

		// Reset visit info after finish?
		// if (this.visit.to && this.isSameResolvedUrl(this.visit.to.url, requestedUrl)) {
		// 	this.createVisit({ to: undefined });
		// }
	} catch (error: unknown) {
		// Return early if error is undefined (probably aborted preload request)
		if (!error) {
			return;
		}

		// Log to console as we swallow almost all hook errors
		console.error(error);

		// Rewrite `skipPopStateHandling` to redirect manually when `history.go` is processed
		this.options.skipPopStateHandling = () => {
			window.location.href = this.visit.to.url as string;
			return true;
		};

		// Go back to the actual page we're still at
		window.history.go(-1);
	}
}
