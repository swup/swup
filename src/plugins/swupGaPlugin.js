module.exports = {
    name: 'swupGaPlugin',
    options: {runScripts: false},
    exec: function(options, swup) {
        document.addEventListener('swup:contentReplaced', function () {
            if (typeof window.ga === 'function') {
                let title = document.title;
                let url = window.location.pathname + window.location.search;

                window.ga('set', 'title', title);
                window.ga('set', 'page', url);
                window.ga('send', 'pageview');

                swup.log(`GA pageview (url '${url}').`);
            } else {
                console.warn('GA is not loaded.');
            }
        })
    }
}