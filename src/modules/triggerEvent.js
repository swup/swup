const triggerEvent = function(eventName, originalEvent) {
	// call saved handlers with "on" method and pass originalEvent object if available
	this._handlers[eventName].forEach((handler) => {
		try {
			handler(originalEvent);
		} catch (error) {
			console.error(error);
		}
	});

	// trigger event on document with prefix "swup:"
	const event = new CustomEvent('swup:' + eventName, { detail: eventName });
	document.dispatchEvent(event);
};

export default triggerEvent;
