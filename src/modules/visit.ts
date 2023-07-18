import Swup from '../Swup.js';
import { createHistoryRecord, updateHistoryRecord, getCurrentUrl, Location } from '../helpers.js';
import { FetchOptions } from './fetchPage.js';
import { ContextInitOptions } from './Context.js';

export type HistoryAction = 'push' | 'replace';
export type HistoryDirection = 'forwards' | 'backwards';

type VisitOptions = {
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
export function visit(
	this: Swup,
	url: string,
	options: VisitOptions & FetchOptions = {},
	context: Omit<ContextInitOptions, 'to'> = {}
) {
	// Check if the visit should be ignored
	if (this.shouldIgnoreVisit(url)) {
		window.location.href = url;
		return;
	}

	const { url: to, hash } = Location.fromUrl(url);
	this.context = this.createContext({ ...context, to, hash });
	this.performVisit(to, options);
}

/**
 * Start a visit to a new URL.
 *
 * Internal method that assumes the global context has already been set up.
 *
 * As a user, you should call `swup.visit(url)` instead.
 *
 * @param url The URL to navigate to.
 * @param options Options for how to perform this visit.
 * @returns Promise<void>
 */
export async function performVisit(
	this: Swup,
	url: string,
	options: VisitOptions & FetchOptions = {}
) {
	if (typeof url !== 'string') {
		throw new Error(`swup.visit() requires a URL parameter`);
	}

	const { el } = this.context.trigger;
	this.context.to.url = Location.fromUrl(url).url;
	options.referrer = options.referrer || this.currentPageUrl;

	if (options.animate === false) {
		this.context.animation.animate = false;
	}

	// Clean up old animation classes
	if (!this.context.animation.animate) {
		this.classes.clear();
	}

	// Get history action from option or attribute on trigger element
	const history = options.history || el?.getAttribute('data-swup-history') || undefined;
	if (history && ['push', 'replace'].includes(history)) {
		this.context.history.action = history as HistoryAction;
	}

	// Get custom animation name from option or attribute on trigger element
	const animation = options.animation || el?.getAttribute('data-swup-animation') || undefined;
	if (animation) {
		this.context.animation.name = animation;
	}

	try {
		await this.hooks.trigger('visit:start');

		// Begin fetching page
		const pagePromise = this.hooks.trigger(
			'page:request',
			{ url: this.context.to.url, options },
			async (context, { options }) => await this.fetchPage(context.to.url as string, options)
		);

		// Create history record if this is not a popstate call (with or without anchor)
		if (!this.context.history.popstate) {
			const newUrl = url + (this.context.scroll.target || '');
			if (this.context.history.action === 'replace') {
				updateHistoryRecord(newUrl);
			} else {
				const index = this.currentHistoryIndex + 1;
				createHistoryRecord(newUrl, { index });
			}
		}

		this.currentPageUrl = getCurrentUrl();

		// Wait for page before starting to animate out?
		if (this.context.animation.wait) {
			const { html } = await pagePromise;
			this.context.to.html = html;
		}

		// Wait for page to load and leave animation to finish
		const animationPromise = this.leavePage();
		const [page] = await Promise.all([pagePromise, animationPromise]);

		// Render page: replace content and scroll to top/fragment
		await this.renderPage(this.context.to.url, page);

		// Wait for enter animation
		await this.enterPage();

		// Finalize visit
		await this.hooks.trigger('visit:end', undefined, () => this.classes.clear());

		// Reset context after visit?
		// if (this.context.to && this.isSameResolvedUrl(this.context.to.url, requestedUrl)) {
		// 	this.createContext({ to: undefined });
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
			window.location.href = this.context.to.url as string;
			return true;
		};

		// Go back to the actual page we're still at
		window.history.go(-1);
	}
}
