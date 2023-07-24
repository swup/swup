import Swup, { Options } from '../Swup.js';
import { HistoryAction, HistoryDirection } from './navigate.js';

/** An object holding details about the current visit. */
export interface Visit {
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
	/** Browser history behavior on this visit */
	history: VisitHistory;
	/** Scroll behavior on this visit */
	scroll: VisitScroll;
}

export interface VisitFrom {
	/** The URL of the previous page */
	url: string;
}

export interface VisitTo {
	/** The URL of the next page */
	url?: string;
	/** The HTML content of the next page */
	html?: string;
}

export interface VisitAnimation {
	/** Whether this visit is animated. Default: `true` */
	animate: boolean;
	/** Whether to wait for the next page to load before starting the animation. Default: `false` */
	wait: boolean;
	/** Name of a custom animation to run. */
	name?: string;
	/** Elements on which to add animation classes. Default: `html` element */
	scope: 'html' | 'containers' | string[];
	/** Selector for detecting animation timing. Default: `[class*="transition-"]` */
	selector: Options['animationSelector'];
}

export interface VisitScroll {
	/** Whether to reset the scroll position after the visit. Default: `true` */
	reset: boolean;
	/** Anchor element to scroll to on the next page. */
	target?: string;
}

export interface VisitTrigger {
	/** DOM element that triggered this visit. */
	el?: Element;
	/** DOM event that triggered this visit. */
	event?: Event;
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
	to: string | undefined;
	from?: string;
	hash?: string;
	animate?: boolean;
	animation?: string;
	targets?: string[];
	el?: Element;
	event?: Event;
	action?: HistoryAction;
	resetScroll?: boolean;
}

/** Create a new visit object. */
export function createVisit(
	this: Swup,
	{
		to,
		from = this.currentPageUrl,
		hash: target,
		animate = true,
		animation: name,
		el,
		event,
		action = 'push',
		resetScroll: reset = true
	}: VisitInitOptions
): Visit {
	return {
		from: { url: from },
		to: { url: to },
		containers: this.options.containers,
		animation: {
			animate,
			wait: false,
			name,
			scope: this.options.animationScope,
			selector: this.options.animationSelector
		},
		trigger: {
			el,
			event
		},
		history: {
			action,
			popstate: false,
			direction: undefined
		},
		scroll: {
			reset,
			target
		}
	};
}
