module.exports = function (eventName) {
    if (this.options.debugMode) {
        console.log('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD')
    }
    var event = new CustomEvent('swup:' + eventName, { detail : eventName })
    document.dispatchEvent(event)
}