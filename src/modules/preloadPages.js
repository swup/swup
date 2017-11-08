import Link from '../Link'

module.exports = function (eventName) {
    if (this.options.preload) {
        const preload = pathname => {
            var link = new Link()
            link.setPath(pathname)
            if (link.getPath() != this.currentUrl && !this.cache.exists(link.getPath()) && this.preloadPromise == null) {
                this.getPage(link.getPath(), response => {
                    if (response === null) {
                        console.warn('Server error.')
                        this.triggerEvent('serverError')
                    } else {
                        // get json data
                        var page = this.getDataFromHtml(response)
                        page.url = link.getPath()
                        this.cache.cacheUrl(page, this.options.debugMode)
                        this.triggerEvent('pagePreloaded')
                    }
                })
            }
        }

        document.querySelectorAll('[data-swup-preload]').forEach(element => {
            preload(element.href)
        })
    }
}