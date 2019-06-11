"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var on = function on(event, handler) {
	if (this._handlers[event]) {
		this._handlers[event].push(handler);
	} else {
		console.warn("Unsupported event " + event + ".");
	}
};

exports.default = on;