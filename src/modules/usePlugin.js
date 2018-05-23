module.exports = function(plugin, options) {
    options = Object.assign({}, plugin.options, options)

    plugin.options = options

    let getCurrentPageHtml = () => {
        let page = this.cache.getPage(window.location.pathname + window.location.search)
        let html = document.createElement('html')
        html.innerHTML = page.originalContent
        return html
    }

    this.plugins.push(plugin)
    plugin.exec(options, this, getCurrentPageHtml)
    return this.plugins
}