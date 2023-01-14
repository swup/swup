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

export const on = function on(this: Swup, event: EventType, handler: Handler) {
	if (this._handlers[event]) {
		this._handlers[event].push(handler);
	} else {
		console.warn(`Unsupported event ${event}.`);
	}
};
