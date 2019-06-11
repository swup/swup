'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var triggerEvent = function triggerEvent(eventName, originalEvent) {
	// call saved handlers with "on" method and pass originalEvent object if available
	this._handlers[eventName].forEach(function (handler) {
		try {
			handler(originalEvent);
		} catch (error) {
			console.error(error);
		}
	});

	// trigger event on document with prefix "swup:"
	var event = new CustomEvent('swup:' + eventName, { detail: eventName });
	document.dispatchEvent(event);
};

exports.default = triggerEvent;