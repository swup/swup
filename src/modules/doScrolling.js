module.exports = function (popstate) {
    if (this.options.scroll && !popstate) {
        if (this.scrollToElement != null) {
            var self = this

            var element = document.querySelector(self.scrollToElement)
            if (element != null) {
                let top = element.getBoundingClientRect().top + window.pageYOffset;
                self.scrollTo(document.body, top);
            } else {
                console.warn(`Element for offset not found (${self.scrollToElement})`)
            }
            self.scrollToElement = null;
        } else {
            this.scrollTo(document.body, 0)
        }
    }
}

