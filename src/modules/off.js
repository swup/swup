module.exports = function off(event, handler) {
    if (event != null) {
        if (handler != null) {
            if (this._handlers[event] && this._handlers[event].filter(savedHandler => savedHandler === handler).length) {
                let toRemove = this._handlers[event].filter(savedHandler => savedHandler === handler)[0];
                let index = this._handlers[event].indexOf(toRemove);
                if (index > -1) {
                    this._handlers[event].splice(index, 1);
                }
            } else {
                console.warn(`Handler for event '${event}' no found.`);
            }
        } else {
            this._handlers[event] = [];
        }
    } else {
        Object.keys(this._handlers).forEach(keys => {
            this._handlers[keys] = [];
        });
    }
}