module.exports = function (from, to, custom) {

    // homepage case
    if (from == "/") {
        from = "/homepage"
    }
    if (to == "/") {
        to = "/homepage"
    }

    // transition routes
    this.transition = {
        from: from.replace('/', ''),
        to: to.replace('/', '')
    }

    if (custom) {
        this.transition.custom = custom
    }
}