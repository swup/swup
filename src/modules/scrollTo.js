module.exports = function (element, to, duration) {
    this.triggerEvent('scrollStart')
    var start = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0),
        change = to - start,
        increment = 20

    var animateScroll = (elapsedTime) => {
        elapsedTime += increment
        var position = easeInOut(elapsedTime, start, change, duration)
        window.scrollTo(0, position)
        if (elapsedTime < duration) {
            setTimeout(() => {
                animateScroll(elapsedTime)
            }, increment)
        } else {
            this.triggerEvent('scrollDone')
        }
    };

    animateScroll(0);

    function easeInOut(currentTime, start, change, duration) {
        currentTime /= duration / 2;
        if (currentTime < 1) {
            return change / 2 * currentTime * currentTime + start;
        }
        currentTime -= 1;
        return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
    }
}

