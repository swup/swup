import Swup from '../Swup';
import delegate from 'delegate-it';

type HandlersEventMap = {
	animationInDone: undefined;
	animationInStart: undefined;
	animationOutDone: undefined;
	animationOutStart: undefined;
	animationSkipped: undefined;
	clickLink: delegate.Event<MouseEvent>;
	contentReplaced: PopStateEvent | undefined;
	disabled: undefined;
	enabled: undefined;
	openPageInNewTab: delegate.Event<MouseEvent>;
	pageLoaded: undefined;
	pageRetrievedFromCache: undefined;
	pageView: PopStateEvent | undefined;
	popState: PopStateEvent;
	samePage: delegate.Event<MouseEvent>;
	samePageWithHash: delegate.Event<MouseEvent>;
	serverError: undefined;
	transitionStart: PopStateEvent | undefined;
	transitionEnd: PopStateEvent | undefined;
	willReplaceContent: PopStateEvent | undefined;
};
type EventTypes = HandlersEventMap[keyof HandlersEventMap];
type AvailableEventNames = keyof HandlersEventMap;

export type Handler<T extends EventTypes = undefined> = (event: T) => void;
export type Handlers = {
	[Key in keyof HandlersEventMap as `${Key}`]: Handler<HandlersEventMap[Key]>[];
};

export function on<TEventType extends AvailableEventNames>(
	this: Swup,
	event: TEventType,
	handler: Handler<HandlersEventMap[TEventType]>
): void {
	const eventHandlers = this._handlers[event] as Handler<HandlersEventMap[TEventType]>[];

	if (eventHandlers) {
		eventHandlers.push(handler);
	} else {
		console.warn(`Unsupported event ${event}.`);
	}
}

export function off<TEventType extends AvailableEventNames>(
	this: Swup,
	event?: TEventType,
	handler?: Handler<HandlersEventMap[TEventType]>
) {
	if (event && handler) {
		const eventHandlers = this._handlers[event] as Handler<HandlersEventMap[TEventType]>[];
		// Remove specific handler
		if (eventHandlers.includes(handler)) {
			(this._handlers[event] as Handler<HandlersEventMap[TEventType]>[]) =
				eventHandlers.filter((h) => h !== handler);
		} else {
			console.warn(`Handler for event '${event}' not found.`);
		}
	} else if (event) {
		// Remove all handlers for specific event
		this._handlers[event] = [];
	} else {
		// Remove all handlers for all events
		Object.keys(this._handlers).forEach((event) => {
			this._handlers[event as keyof HandlersEventMap] = [];
		});
	}
}

export function triggerEvent<TEventType extends AvailableEventNames>(
	this: Swup,
	eventName: TEventType,
	originalEvent?: HandlersEventMap[TEventType]
): void {
	const eventHandlers = this._handlers[eventName] as Handler<HandlersEventMap[TEventType]>[];

	// call saved handlers with "on" method and pass originalEvent object if available
	eventHandlers.forEach((handler) => {
		try {
			handler(originalEvent as HandlersEventMap[TEventType]);
		} catch (error) {
			console.error(error);
		}
	});

	// trigger event on document with prefix "swup:"
	const event = new CustomEvent(`swup:${eventName}`, { detail: eventName });
	document.dispatchEvent(event);
}
