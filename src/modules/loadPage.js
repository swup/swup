const { forEach } = Array.prototype;

module.exports = function (data, popstate) {
    var finalPage = null

    // scrolling
    if (this.options.doScrollingRightAway && !this.scrollToElement) {
        this.doScrolling(popstate)
    }

    let animationPromises = []

    if (!popstate) {
        // start animation
        document.documentElement.classList.add('is-changing')
        document.documentElement.classList.add('is-leaving')
        document.documentElement.classList.add('is-animating')
        document.documentElement.classList.add('to-' + this.classify(data.url))

        // detect animation end
        let animatedElements = document.querySelectorAll(this.options.animationSelector)
        animatedElements
            ::forEach(element => {
            var promise = new Promise(resolve => {
                element.addEventListener(this.transitionEndEvent, event => {
                    if (element == event.target) {
                        resolve()
                    }
                })
            })
            animationPromises.push(promise);
        });

        Promise
            .all(animationPromises)
            .then(() => {
                this.triggerEvent('animationOutDone')
            })

        // create pop element with or without anchor
        if (this.scrollToElement != null) {
            var pop = data.url + this.scrollToElement;
        } else {
            var pop = data.url;
        }
        this.createState(pop)
    } else {
        // proceed without animating
        this.triggerEvent('animationSkipped')
    }

    if (this.cache.exists(data.url)) {
        var xhrPromise = new Promise(resolve => {
            resolve()
        })
        this.triggerEvent('pageRetrievedFromCache')
    } else {
        if (!this.preloadPromise || this.preloadPromise.route != data.url) {
            var xhrPromise = new Promise(resolve => {
                this.getPage(data, response => {
                    if (response === null) {
                        console.warn('Server error.')
                        this.triggerEvent('serverError')
                        this.goBack()
                    } else {
                        // get json data
                        var page = this.getDataFromHtml(response)
                        page.url = data.url
                        // render page
                        this.cache.cacheUrl(page, this.options.debugMode)
                        this.triggerEvent('pageLoaded')
                    }
                    resolve()
                })
            })
        } else {
            var xhrPromise = this.preloadPromise
        }
    }

    Promise
        .all(animationPromises.concat([xhrPromise]))
        .then(() => {
            finalPage = this.cache.getPage(data.url)
            if (!this.options.cache) {
                this.cache.empty(this.options.debugMode)
            }
            this.renderPage(finalPage, popstate)
            this.preloadPromise = null
        })
}