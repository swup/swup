export default class Cache {
    constructor() {
        this.pages = {}
        this.count = 0
        this.last = null
    }

    cacheUrl (page, displayCache) {
        this.count++
        if (page.url in this.pages === false) {
            this.pages[page.url] = page
        }
        this.last = this.pages[page.url]
        if (displayCache) {
            this.displayCache()
        }
    }

    getPage (url) {
        return this.pages[url]
    }

    displayCache () {
        console.groupCollapsed(`Cache (${Object.keys(this.pages).length})`)
        for (var key in this.pages){
            console.log(this.pages[key])
        }
        console.groupEnd()
    }

    exists (url) {
        if (url in this.pages)
            return true
        return false
    }

    empty (showLog) {
        this.pages = {}
        this.count = 0
        this.last = null
        if (showLog) {
            console.log('Cache cleared')
        }
    }

    remove (url) {
        delete this.pages[url]
    }
}