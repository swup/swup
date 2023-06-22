import { getCurrentUrl } from '../helpers.js';
import { HistoryAction } from './loadPage.js';

export interface Context<TEvent = Event> {
	from?: PageContext;
	to?: PageContext;
	animate: boolean;
	transition?: string;
	action?: HistoryAction;
	scroll: ScrollContext;
	trigger: TriggerContext<TEvent>;
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
	history: boolean;
}

export function createContext({
	from,
	to,
	action,
	event,
	el,
	hash: target,
	animate = true,
	transition,
	history = false
}: {
	from?: string;
	to?: string;
	hash?: string;
	event?: Event;
	el?: Element;
	animate?: boolean;
	transition?: string;
	history?: boolean;
	action?: HistoryAction;
} = {}): Context {
	return {
		from: { url: from ?? getCurrentUrl() },
		to: to ? { url: to } : undefined,
		action,
		animate,
		transition,
		scroll: {
			reset: true,
			target
		},
		trigger: {
			el,
			event,
			history
		}
	};
}
