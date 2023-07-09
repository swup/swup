import delegate, { DelegateEventHandler, DelegateOptions, EventType } from 'delegate-it';
import { ParseSelector } from 'typed-query-selector/parser.js';

export type DelegateEventUnsubscribe = {
	destroy: () => void;
};

export const delegateEvent = <Selector extends string, TEvent extends EventType>(
	selector: Selector,
	type: TEvent,
	callback: DelegateEventHandler<GlobalEventHandlersEventMap[TEvent]>,
	options?: DelegateOptions
): DelegateEventUnsubscribe => {
	const controller = new AbortController();
	options = { ...options, signal: controller.signal };
	delegate<string, ParseSelector<Selector, HTMLElement>, TEvent>(
		selector,
		type,
		callback,
		options
	);
	return { destroy: () => controller.abort() };
};
