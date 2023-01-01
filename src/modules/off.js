const off = function off(event, handler) {
	if (event && handler) {
		// Remove specific handler
		if (this._handlers[event].includes(handler)) {
			this._handlers[event] = this._handlers[event].filter((h) => h !== handler);
		} else {
			console.warn(`Handler for event '${event}' no found.`);
		}
	} else if (event) {
		// Remove all handlers for specific event
		this._handlers[event] = [];
	} else {
		// Remove all handlers for all events
		Object.keys(this._handlers).forEach((event) => {
			this._handlers[event] = [];
		});
	}
};

export default off;
