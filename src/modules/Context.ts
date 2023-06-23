import Swup from '../Swup.js';
import { HistoryAction } from './loadPage.js';

export interface Context<TEvent = Event> {
	from: PageContext;
	to?: PageContext;
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

export function createContext(
	this: Swup,
	{
		to,
		from = this.currentPageUrl,
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
		from?: string;
		hash?: string;
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
