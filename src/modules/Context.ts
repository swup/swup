import Swup, { Options } from '../Swup.js';
import { HistoryAction } from './visit.js';

export interface Context<TEvent = Event> {
	/** The previous page, about to leave */
	from: FromContext;
	/** The next page, about to enter */
	to: ToContext;
	/** The content containers, about to be replaced */
	containers: Options['containers'];
	/** Information about animated page transitions */
	animation: AnimationContext;
	/** What triggered this visit */
	trigger: TriggerContext<TEvent>;
	/** Browser history behavior on this visit */
	history: HistoryContext;
	/** Scroll behavior on this visit */
	scroll: ScrollContext;
}

export interface FromContext {
	/** The URL of the previous page */
	url: string;
}

export interface ToContext {
	/** The URL of the next page */
	url?: string;
	/** The HTML content of the next page */
	html?: string;
}

export interface AnimationContext {
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

export interface ScrollContext {
	/** Whether to reset the scroll position after the visit. Default: `true` */
	reset: boolean;
	/** Anchor element to scroll to on the next page. */
	target?: string;
}

export interface TriggerContext<TEvent = Event> {
	/** DOM element that triggered this visit. */
	el?: Element;
	/** DOM event that triggered this visit. */
	event?: TEvent;
}

export interface HistoryContext {
	/** History action to perform: `push` for creating a new history entry, `replace` for replacing the current entry. Default: `push` */
	action: HistoryAction;
	/** Whether this visit was triggered by a browser history navigation. */
	popstate: boolean;
	// direction: 'forward' | 'backward' | undefined
}

export interface ContextInitOptions {
	to: string | undefined;
	from?: string;
	hash?: string;
	animate?: boolean;
	animation?: string;
	targets?: string[];
	el?: Element;
	event?: Event;
	popstate?: boolean;
	action?: HistoryAction;
	resetScroll?: boolean;
}

export function createContext(
	this: Swup,
	{
		to,
		from = this.currentPageUrl,
		hash: target,
		animate = true,
		animation: name,
		el,
		event,
		popstate = false,
		action = 'push',
		resetScroll: reset = true
	}: ContextInitOptions
): Context {
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
			popstate
			// direction: undefined
		},
		scroll: {
			reset,
			target
		}
	};
}
