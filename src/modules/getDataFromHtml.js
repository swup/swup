module.exports = function (html) {
    let content = html.replace('<body', '<div id="swupBody"').replace('</body>', '</div>')
    let fakeDom = document.createElement('div')
    fakeDom.innerHTML = content
    let blocks = []

    for (var i = 0; i < this.options.elements.length; i++) {
        if (fakeDom.querySelector(this.options.elements[i]) == null) {
            console.warn(`Element ${this.options.elements[i]} is not found in cached page.`)
            return null;
        } else {
            [].forEach.call(document.body.querySelectorAll(this.options.elements[i]), (item, index) => {
                fakeDom.querySelectorAll(this.options.elements[i])[index].dataset.swup = blocks.length;
                blocks.push(fakeDom.querySelectorAll(this.options.elements[i])[index].outerHTML)
            })
        }
    }

    var json = {
        title: fakeDom.querySelector('title').innerText,
        pageClass:  fakeDom.querySelector('#swupBody').className,
        originalContent: html,
        blocks: blocks
    }
    return json;
}