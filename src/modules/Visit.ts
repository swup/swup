import type Swup from '../Swup.js';
import type { Options } from '../Swup.js';
import type { HistoryAction, HistoryDirection } from './navigate.js';

/** See below for the class Visit {} definition */
// export interface Visit {}

export interface VisitFrom {
	/** The URL of the previous page */
	url: string;
	/** The hash of the previous page */
	hash?: string;
}

export interface VisitTo {
	/** The URL of the next page */
	url: string;
	/** The hash of the next page */
	hash?: string;
	/** The HTML content of the next page */
	html?: string;
	/** The parsed document of the next page, available during visit */
	document?: Document;
}

export interface VisitAnimation {
	/** Whether this visit is animated. Default: `true` */
	animate: boolean;
	/** Whether to wait for the next page to load before starting the animation. Default: `false` */
	wait: boolean;
	/** Name of a custom animation to run. */
	name?: string;
	/** Whether this animation uses the native browser ViewTransition API. Default: `false` */
	native: boolean;
	/** Elements on which to add animation classes. Default: `html` element */
	scope: 'html' | 'containers' | string[];
	/** Selector for detecting animation timing. Default: `[class*="transition-"]` */
	selector: Options['animationSelector'];
}

export interface VisitScroll {
	/** Whether to reset the scroll position after the visit. Default: `true` */
	reset: boolean;
	/** Anchor element to scroll to on the next page. */
	target?: string | false;
}

export interface VisitTrigger {
	/** DOM element that triggered this visit. */
	el?: Element;
	/** DOM event that triggered this visit. */
	event?: Event;
}

export interface VisitCache {
	/** Whether this visit will try to load the requested page from cache. */
	read: boolean;
	/** Whether this visit will save the loaded page in cache. */
	write: boolean;
}

export interface VisitHistory {
	/** History action to perform: `push` for creating a new history entry, `replace` for replacing the current entry. Default: `push` */
	action: HistoryAction;
	/** Whether this visit was triggered by a browser history navigation. */
	popstate: boolean;
	/** The direction of travel in case of a browser history navigation: backward or forward. */
	direction: HistoryDirection | undefined;
}

export interface VisitInitOptions {
	to: string;
	from?: string;
	hash?: string;
	el?: Element;
	event?: Event;
}

/** @internal */
export const VisitState = {
	CREATED: 1,
	QUEUED: 2,
	STARTED: 3,
	LEAVING: 4,
	LOADED: 5,
	ENTERING: 6,
	COMPLETED: 7,
	ABORTED: 8,
	FAILED: 9
} as const;

/** @internal */
export type VisitState = (typeof VisitState)[keyof typeof VisitState];

/** An object holding details about the current visit. */
export class Visit {
	/** A unique ID to identify this visit */
	id: number;
	/** The current state of this visit @internal */
	state: VisitState;
	/** The previous page, about to leave */
	from: VisitFrom;
	/** The next page, about to enter */
	to: VisitTo;
	/** The content containers, about to be replaced */
	containers: Options['containers'];
	/** Information about animated page transitions */
	animation: VisitAnimation;
	/** What triggered this visit */
	trigger: VisitTrigger;
	/** Cache behavior for this visit */
	cache: VisitCache;
	/** Browser history behavior on this visit */
	history: VisitHistory;
	/** Scroll behavior on this visit */
	scroll: VisitScroll;
	/** User-defined metadata */
	meta: Record<string, unknown>;

	constructor(swup: Swup, options: VisitInitOptions) {
		const { to, from, hash, el, event } = options;

		this.id = Math.random();
		this.state = VisitState.CREATED;
		this.from = { url: from ?? swup.location.url, hash: swup.location.hash };
		this.to = { url: to, hash };
		this.containers = swup.options.containers;
		this.animation = {
			animate: true,
			wait: false,
			name: undefined,
			native: swup.options.native,
			scope: swup.options.animationScope,
			selector: swup.options.animationSelector
		};
		this.trigger = { el, event };
		this.cache = {
			read: swup.options.cache,
			write: swup.options.cache
		};
		this.history = {
			action: 'push',
			popstate: false,
			direction: undefined
		};
		this.scroll = {
			reset: true,
			target: undefined
		};
		this.meta = {};
	}

	/** @internal */
	advance(state: VisitState) {
		if (this.state < state) {
			this.state = state;
		}
	}

	/** @internal */
	abort() {
		this.state = VisitState.ABORTED;
	}

	/** Is this visit done, i.e. completed, failed, or aborted? */
	get done(): boolean {
		return this.state >= VisitState.COMPLETED;
	}
}

/** Create a new visit object. */
export function createVisit(this: Swup, options: VisitInitOptions): Visit {
	return new Visit(this, options);
}
