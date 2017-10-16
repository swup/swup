module.exports = function (element) {
    let blocks = 0

    for (var i = 0; i < this.options.elements.length; i++) {
        if (element.querySelector(this.options.elements[i]) == null) {
            console.warn(`Element ${this.options.elements[i]} is not in current page.`)
        } else {
            [].forEach.call(document.body.querySelectorAll(this.options.elements[i]), (item, index) => {
                element.querySelectorAll(this.options.elements[i])[index].dataset.swup = blocks
                blocks++
            })
        }
    }
}