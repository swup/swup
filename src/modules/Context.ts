import Swup, { Options } from '../Swup.js';
import { HistoryAction } from './visit.js';

export interface Context<TEvent = Event> {
	from: FromContext;
	to: ToContext;
	containers: Options['containers'];
	animation: AnimationContext;
	trigger: TriggerContext<TEvent>;
	history: HistoryContext;
	scroll: ScrollContext;
}

export interface FromContext {
	url: string;
}

export interface ToContext {
	url?: string;
	html?: string;
}

export interface AnimationContext {
	animate: boolean;
	wait: boolean;
	name?: string;
	scope: 'html' | 'containers' | string[];
	selector: Options['animationSelector'];
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
