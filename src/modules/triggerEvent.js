module.exports = function (eventName, originalEvent) {
    if (this.options.debugMode && originalEvent) {
        console.groupCollapsed('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD')
        console.log(originalEvent)
        console.groupEnd()
    } else if (this.options.debugMode) {
        console.log('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD')
    }

    // call saved handlers with "on" method and pass originalEvent object if available
    this._handlers[eventName].forEach(handler => {
        try {
            handler(originalEvent)
        } catch(error) {
            console.error(error);
        }
    });

    // trigger event on document with prefix "swup:"
    var event = new CustomEvent('swup:' + eventName, { detail : eventName })
    document.dispatchEvent(event)
}