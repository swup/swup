module.exports = function (popstate) {
    if (this.options.scroll && (!popstate || this.options.animateHistoryBrowsing)) {
        if (this.scrollToElement != null) {
            var element = document.querySelector(this.scrollToElement)
            if (element != null) {
                let top = element.getBoundingClientRect().top + window.pageYOffset;
                this.scrollTo(document.body, top);
            } else {
                console.warn(`Element for offset not found (${this.scrollToElement})`)
            }
            this.scrollToElement = null;
        } else {
            this.scrollTo(document.body, 0)
        }
    }
}

