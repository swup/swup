import Link from "../Link";

module.exports = function(pathname) {
    let link = new Link()
    link.setPath(pathname)
    return new Promise((resolve, reject) => {
        if (link.getAddress() != this.currentUrl && !this.cache.exists(link.getAddress())) {
            this.getPage({url: link.getAddress()}, (response, request) => {
                if (request.status === 500) {
                    this.triggerEvent('serverError')
                    reject()
                } else {
                    // get json data
                    var page = this.getDataFromHtml(response, request)
                    if (page != null) {
                        page.url = link.getAddress()
                        this.cache.cacheUrl(page, this.options.debugMode)
                        this.triggerEvent('pagePreloaded')
                    }
                    resolve(this.cache.getPage(link.getAddress()))
                }
            })
        } else {
            resolve(this.cache.getPage(link.getAddress()))
        }
    })
}