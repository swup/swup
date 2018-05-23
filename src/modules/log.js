module.exports = function (str) {
    if (this.options.debugMode) {
        console.log(str + '%c', 'color: #009ACD')
    }
}