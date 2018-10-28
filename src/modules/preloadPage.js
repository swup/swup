import Link from "../Link";

module.exports = function(pathname) {
    var link = new Link()
    link.setPath(pathname)
    if (link.getAddress() != this.currentUrl && !this.cache.exists(link.getAddress()) && this.preloadPromise == null) {
        this.getPage({ url: link.getAddress() }, (response, request) => {
            if (request.status === 500) {
                this.triggerEvent('serverError')
                return;
            } else {
                // get json data
                var page = this.getDataFromHtml(response, request)
                if (page != null) {
                    page.url = link.getAddress()
                    this.cache.cacheUrl(page, this.options.debugMode)
                    this.triggerEvent('pagePreloaded')
                }
            }
        })
    }
}