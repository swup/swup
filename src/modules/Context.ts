import Swup, { Options } from '../Swup.js';
import { HistoryAction } from './loadPage.js';

export interface Context<TEvent = Event> {
	from: PageContext;
	to?: PageContext;
	containers: Options['containers'];
	transition: TransitionContext;
	trigger: TriggerContext<TEvent>;
	history: HistoryContext;
	scroll: ScrollContext;
}

export interface PageContext {
	url: string;
}

export interface TransitionContext {
	animate: boolean;
	name?: string;
}

export interface ScrollContext {
	reset: boolean;
	target?: string;
}

export interface TriggerContext<TEvent = Event> {
	el?: Element;
	event?: TEvent;
}

export interface HistoryContext {
	action: HistoryAction;
	popstate: boolean;
	// direction: 'forward' | 'backward' | undefined
}

export interface ContextInitOptions {
	to: string | undefined;
	from?: string;
	hash?: string;
	containers?: Options['containers'];
	animate?: boolean;
	transition?: string;
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
		containers = this.options.containers,
		animate = true,
		transition,
		el,
		event,
		popstate = false,
		action = 'push',
		resetScroll: reset = true
	}: ContextInitOptions
): Context {
	return {
		from: { url: from },
		to: to ? { url: to } : undefined,
		containers,
		transition: {
			animate,
			name: transition
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
