module.exports = function (page, popstate) {
    setTimeout(() => {
        document.body.classList.remove('is-changing');
        history.back()
    }, 100)
}