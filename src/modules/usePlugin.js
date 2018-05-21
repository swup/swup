module.exports = function(plugin, options) {
    this.plugins.push(plugin)
    plugin(options, this)
    return this.plugins
}