import delegate, { EventType } from 'delegate-it';
import { ParseSelector } from 'typed-query-selector/parser.js';

export type Unsubscribe = {
	destroy: () => void;
};
export const delegateEvent = <Selector extends string, TEvent extends EventType>(
	selector: Selector,
	type: TEvent,
	callback: delegate.EventHandler<GlobalEventHandlersEventMap[TEvent]>,
	{ base = document, ...eventOptions } = {}
): Unsubscribe => {
	const delegation = delegate<string, ParseSelector<Selector, HTMLElement>, TEvent>(
		base,
		selector,
		type,
		callback,
		eventOptions
	);
	return { destroy: () => delegation.destroy() };
};
