import { getCurrentUrl } from '../helpers.js';

export interface Context {
	from?: PageContext;
	to?: PageContext;
	animate: boolean;
	transition?: string;
	scroll: ScrollContext;
	trigger: TriggerContext;
}

export interface PageContext {
	url: string;
}

export interface ScrollContext {
	reset: boolean;
	target?: string;
}

export interface TriggerContext {
	el?: Element;
	event?: Event;
	history: boolean;
}

export function createContext({
	from,
	to,
	event,
	el,
	history = false
}: {
	from?: string;
	to?: string;
	event?: Event;
	el?: Element;
	history?: boolean;
} = {}): Context {
	return {
		from: { url: from ?? getCurrentUrl() },
		to: to ? { url: to } : undefined,
		animate: true,
		transition: undefined,
		scroll: {
			reset: true,
			target: undefined
		},
		trigger: { el, event, history }
	};
}
