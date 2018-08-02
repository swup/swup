module.exports = {
    name: 'swupGtmPlugin',
    options: {runScripts: false},
    exec: function(options, swup) {
        document.addEventListener('swup:contentReplaced', event => {
            if (typeof window.dataLayer === 'object') {
                let object = {
                    'event': 'VirtualPageview',
                    'virtualPageURL': window.location.pathname + window.location.search,
                    'virtualPageTitle': document.title
                };

                window.dataLayer.push(object);

                swup.log(`GTM pageview (url '${object.virtualPageURL}').`);
            } else {
                console.warn('GTM is not loaded.')
            }
        })
    }
}