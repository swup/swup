import Swup from '../Swup.js';

export type EventType =
	| 'animationInDone'
	| 'animationInStart'
	| 'animationOutDone'
	| 'animationOutStart'
	| 'animationSkipped'
	| 'clickLink'
	| 'contentReplaced'
	| 'disabled'
	| 'enabled'
	| 'openPageInNewTab'
	| 'pageLoaded'
	| 'pageRetrievedFromCache'
	| 'pageView'
	| 'popState'
	| 'samePage'
	| 'samePageWithHash'
	| 'serverError'
	| 'transitionStart'
	| 'transitionEnd'
	| 'willReplaceContent';
export type Handler = (event?: Event) => void;
export type Handlers = Record<EventType, Handler[]>;

export function on(this: Swup, event: EventType, handler: Handler) {
	if (this._handlers[event]) {
		this._handlers[event].push(handler);
	} else {
		console.warn(`Unsupported event ${event}.`);
	}
}

export function off(this: Swup, event?: EventType, handler?: Handler) {
	if (event && handler) {
		// Remove specific handler
		if (this._handlers[event].includes(handler)) {
			this._handlers[event] = this._handlers[event].filter((h) => h !== handler);
		} else {
			console.warn(`Handler for event '${event}' not found.`);
		}
	} else if (event) {
		// Remove all handlers for specific event
		this._handlers[event] = [];
	} else {
		// Remove all handlers for all events
		Object.keys(this._handlers).forEach((event) => {
			this._handlers[event as EventType] = [];
		});
	}
}

export function triggerEvent(
	this: Swup,
	eventName: EventType,
	originalEvent?: PopStateEvent | MouseEvent
): void {
	// call saved handlers with "on" method and pass originalEvent object if available
	this._handlers[eventName].forEach((handler) => {
		try {
			handler(originalEvent);
		} catch (error) {
			console.error(error);
		}
	});

	// trigger event on document with prefix "swup:"
	const event = new CustomEvent(`swup:${eventName}`, { detail: eventName });
	document.dispatchEvent(event);
}
