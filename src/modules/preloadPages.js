module.exports = function () {
    if (this.options.preload) {
        document.querySelectorAll('[data-swup-preload]').forEach(element => {
            this.preloadPage(element.href)
        })
    }
}