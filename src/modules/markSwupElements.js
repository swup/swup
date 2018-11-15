import { queryAll } from "./utils";

module.exports = function (element) {
    let blocks = 0

    for (var i = 0; i < this.options.elements.length; i++) {
        if (element.querySelector(this.options.elements[i]) == null) {
            console.warn(`Element ${this.options.elements[i]} is not in current page.`)
        } else {
            queryAll(this.options.elements[i]).forEach((item, index) => {
                queryAll(this.options.elements[i], element)[index].dataset.swup = blocks
                blocks++
            })
        }
    }
}