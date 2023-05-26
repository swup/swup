import delegate, { DelegateEventHandler, DelegateOptions, EventType } from 'delegate-it';
import { ParseSelector } from 'typed-query-selector/parser.js';

export type Unsubscribe = {
	destroy: () => void;
};

export const delegateEvent = <Selector extends string, TEvent extends EventType>(
	selector: Selector,
	type: TEvent,
	callback: DelegateEventHandler<GlobalEventHandlersEventMap[TEvent]>,
	options?: DelegateOptions
): Unsubscribe => {
	const controller = new AbortController();
	delegate<string, ParseSelector<Selector, HTMLElement>, TEvent>(
		selector,
		type,
		callback,
		options
	);
	return { destroy: () => controller.abort() };
};
