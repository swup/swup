import Swup, { Options } from '../Swup.js';
import { HistoryAction } from './loadPage.js';

export interface Context<TEvent = Event> {
	from: PageContext;
	to?: PageContext;
	containers: Options['containers'];
	animate: boolean;
	transition?: string;
	trigger: TriggerContext<TEvent>;
	history: HistoryContext;
	scroll: ScrollContext;
}

export interface PageContext {
	url: string;
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

export function createContext(
	this: Swup,
	{
		to,
		from = this.currentPageUrl,
		containers = this.options.containers,
		hash: target,
		el,
		event,
		animate = true,
		transition,
		popstate = false,
		action = 'push',
		resetScroll: reset = true
	}: {
		to: string | undefined;
		hash?: string;
		from?: string;
		containers?: Options['containers'];
		el?: Element;
		event?: Event;
		animate?: boolean;
		transition?: string;
		popstate?: boolean;
		action?: HistoryAction;
		resetScroll?: boolean;
	}
): Context {
	return {
		from: { url: from },
		to: to ? { url: to } : undefined,
		containers,
		animate,
		transition,
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
