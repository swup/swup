import {queryAll} from "./utils";

module.exports = function () {
    if (this.options.preload) {
        queryAll('[data-swup-preload]').forEach(element => {
            this.preloadPage(element.href)
        })
    }
}