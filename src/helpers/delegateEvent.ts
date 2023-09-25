import delegate, {
	type DelegateEventHandler,
	type DelegateOptions,
	type EventType
} from 'delegate-it';
import type { ParseSelector } from 'typed-query-selector/parser.js';

export type DelegateEventUnsubscribe = {
	destroy: () => void;
};

/** Register a delegated event listener. */
export const delegateEvent = <
	Selector extends string,
	TElement extends Element = ParseSelector<Selector, HTMLElement>,
	TEvent extends EventType = EventType
>(
	selector: Selector,
	type: TEvent,
	callback: DelegateEventHandler<GlobalEventHandlersEventMap[TEvent], TElement>,
	options?: DelegateOptions
): DelegateEventUnsubscribe => {
	const controller = new AbortController();
	options = { ...options, signal: controller.signal };
	delegate<Selector, TElement, TEvent>(selector, type, callback, options);
	return { destroy: () => controller.abort() };
};
