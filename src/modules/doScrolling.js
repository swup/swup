module.exports = function (popstate) {
    if (this.options.scroll && !popstate) {
        if (this.scrollToElement != null) {
            var self = this

            var element = document.querySelector(self.scrollToElement)
            if (element != null) {
                if (self.animateScrollToAnchor) {
                    self.scrollTo(document.body, element.offsetTop, this.options.scrollDuration)
                } else {
                    self.scrollTo(document.body, element.offsetTop, 20)
                }
            } else {
                console.warn(`Element for offset not found (${self.scrollToElement})`)
            }
            self.scrollToElement = null;

        } else {
            if (this.mobile && !this.options.animateScrollOnMobile) {
                this.scrollTo(document.body, 0, 0)
            } else if (this.mobile && this.options.animateScrollOnMobile) {
                this.scrollTo(document.body, 0, this.options.scrollDuration)
            } else {
                this.scrollTo(document.body, 0, this.options.scrollDuration)
            }
        }
    }
}

