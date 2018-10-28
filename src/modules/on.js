module.exports = function on(event, handler) {
    if (this._handlers[event]) {
        this._handlers[event].push(handler);
    } else {
        console.warn(`Unsupported event ${event}.`);
    }
}