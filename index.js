import enquire from 'enquire.js'
import delegate from 'delegate'

// helpers
import Cache from './Cache'
import Link from './Link'
import transitionEnd from './transitionEnd'

// modules
import request from './modules/request'
import getDataFromHtml from './modules/getDataFromHtml'
import loadPage from './modules/loadPage'
import renderPage from './modules/renderPage'
import goBack from './modules/goBack'
import createState from './modules/createState'
import triggerEvent from './modules/triggerEvent'
import getUrl from './modules/getUrl'
import scrollTo from './modules/scrollTo'
import classify from './modules/classify'
import doScrolling from './modules/doScrolling'
import markSwupElements from './modules/markSwupElements'

export default class Swup {
    constructor(setOptions) {
        // default options
        let defaults = {
            cache: true,
            animationSelector: '[class^="a-"]',
            elements: ['#swup'],
            pageClassPrefix: '',
            debugMode: false,
            scroll: true,
            preload: true,
            support: true,

            animateScrollToAnchor: false,
            animateScrollOnMobile: false,
            doScrollingRightAway: false,
            scrollDuration: 0,

            LINK_SELECTOR: 'a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup]), a[xlink\\:href]'
        }

        let options = {
            ...defaults,
            ...setOptions
        }

        /**
        * helper variables
        */
        // mobile detection variable
        this.mobile = false
        // id of element to scroll to after render
        this.scrollToElement = null
        // promise used for preload, so no new loading of the same page starts while page is loading
        this.preloadPromise = null
        // save options
        this.options = options

        /**
         * make modules accessible in instance
         */
        this.getUrl = getUrl
        this.cache = new Cache()
        this.link = Link
        this.transitionEndEvent = transitionEnd()
        this.getDataFromHtml = getDataFromHtml
        this.getPage = request
        this.scrollTo = scrollTo
        this.loadPage = loadPage
        this.renderPage = renderPage
        this.goBack = goBack
        this.createState = createState
        this.triggerEvent = triggerEvent
        this.classify = classify
        this.doScrolling = doScrolling
        this.markSwupElements = markSwupElements

        /**
         * detect mobile devices
         */
        if (this.options.scroll) {
            enquire.register('screen and (max-width: 47.9375em)', {
                match: () => {
                    this.mobile = true
                },
                unmatch: () => {
                    this.mobile = false
                }
            })
        }

        // attach instance to window in debug mode
        if (this.options.debugMode) {
            window.swup = this
        }

        this.getUrl()
        this.prepare()
    }

    prepare() {
        /**
         * support check
         */
        if (this.support) {
            // check pushState support
            if (!('pushState' in window.history)) {
                console.warn('pushState is not supported')
                return
            }
            // check transitionEnd support
            if (transitionEnd()) {
                this.transitionEndEvent = transitionEnd()
            } else {
                console.warn('transitionEnd detection is not supported')
                return
            }
            // check Promise support
            if(typeof Promise === "undefined" || Promise.toString().indexOf("[native code]") === -1){
                console.warn('Promise is not supported')
                return
            }
        }

        /**
         * link click handler
         */
        delegate(document, this.options.LINK_SELECTOR, 'click', event => {
            // no control key pressed
            if (!event.metaKey) {
                this.triggerEvent('clickLink')
                var link = new Link()
                event.preventDefault()
                link.setPath(event.delegateTarget.href)
                if (link.getPath() == this.currentUrl || link.getPath() == '') {
                    if (link.getHash() != '') {
                        this.triggerEvent('samePageWithHash')
                        var element = document.querySelector(link.getHash())
                        if (element != null) {
                            if (this.options.scroll) {
                                this.scrollTo(document.body, element.offsetTop, 320)
                            }
                            history.replaceState(undefined, undefined, link.getHash())
                        } else {
                            console.warn(`Element for offset not found (${link.getHash()})`)
                        }
                    } else {
                        this.triggerEvent('samePage')
                        if (this.options.scroll) {
                            this.scrollTo(document.body, 0, 320)
                        }
                    }
                } else {
                    if (link.getHash() != '') {
                        this.scrollToElement = link.getHash()
                    }
                    // custom class fro dynamic pages
                    var swupClass = event.delegateTarget.dataset.swupClass
                    if (swupClass != null) {
                        document.documentElement.classList.add(`to-${swupClass}`)
                    }
                    this.loadPage(link.getPath(), false)
                }
            } else {
                this.triggerEvent('openPageInNewTab')
            }
        });

        /**
         * link mouseover handler (preload)
         */
        delegate(document.body, this.options.LINK_SELECTOR, 'mouseover', event => {
            this.triggerEvent('hoverLink')
            if (this.options.preload) {
                var link = new Link()
                link.setPath(event.delegateTarget.href)
                if (link.getPath() != this.currentUrl && !this.cache.exists(link.getPath()) && this.preloadPromise == null) {
                    this.preloadPromise = new Promise(resolve => {
                        this.getPage(link.getPath(), response => {
                            if (response === null) {
                                console.warn('Server error.')
                                this.triggerEvent('serverError')
                            } else {
                                this.triggerEvent('pagePreloaded')
                                // get json data
                                var page = this.getDataFromHtml(response)
                                page.url = link.getPath()
                                this.cache.cacheUrl(page, this.options.debugMode)
                            }
                            resolve()
                            this.preloadPromise = null
                        })
                    })
                    this.preloadPromise.route = link.getPath()
                }
            }
        });

        /**
         * popstate handler
         */
        window.onpopstate = (event) => {
            var link = new Link();
            link.setPath(event.state ? event.state.url : window.location.pathname)
            if (link.getHash() != '') {
                this.scrollToElement = link.getHash()
            } else {
                event.preventDefault()
            }
            this.triggerEvent('popState')
            this.loadPage(link.getPath(), event)
        };

        /**
         * initial save to cache
         */
        var page = this.getDataFromHtml(document.documentElement.innerHTML)
        page.url = this.currentUrl
        if (this.options.cache) {
            this.cache.cacheUrl(page, this.options.debugMode)
        }
        this.markSwupElements(document.documentElement)
        this.triggerEvent('pageView')
    }
}