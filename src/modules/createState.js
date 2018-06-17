module.exports = function (url) {
    window.history.pushState(
        {
            url: url || window.location.href.split(window.location.hostname)[1],
            random: Math.random(),
            source: "swup",
        },
        document.getElementsByTagName('title')[0].innerText,
        url || window.location.href.split(window.location.hostname)[1]
    );
}