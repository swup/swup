import delegate from 'delegate'
import detectie from 'detectie'

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
import updateTransition from './modules/updateTransition'
import preloadPages from './modules/preloadPages'
import usePlugin from './modules/usePlugin'

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

            doScrollingRightAway: false,
            animateScroll: true,
            scrollFriction: .3,
            scrollAcceleration: .04,

            preload: true,
            support: true,
            disableIE: false,

            LINK_SELECTOR: 'a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup]), a[xlink\\:href]'
        }

        /**
         * current transition object
         */
        this.transition = {}

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
        // plugins array
        this.plugins = []

        /**
         * make modules accessible in instance
         */
        this.getUrl = getUrl
        this.cache = new Cache()
        this.link = new Link()
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
        this.updateTransition = updateTransition
        this.preloadPages = preloadPages
        this.usePlugin = usePlugin
        this.detectie = detectie
        this.enable = this.enable
        this.destroy = this.destroy

        /**
         * detect mobile devices
         */
        if (window.innerWidth <= 767) {
            this.mobile = true
        }

        // attach instance to window in debug mode
        if (this.options.debugMode) {
            window.swup = this
        }

        this.getUrl()
        this.enable()
    }

    enable() {
        /**
         * support check
         */
        if (this.options.support) {
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
         * disable IE
         */
        if (this.options.disableIE && this.detectie()) {
            return
        }

        // variable to keep event listeners from "delegate"
        this.delegatedListeners = {}

        /**
         * link click handler
         */
        this.delegatedListeners.click = delegate(document, this.options.LINK_SELECTOR, 'click', this.linkClickHandler.bind(this))

        /**
         * link mouseover handler (preload)
         */
        this.delegatedListeners.mouseover = delegate(document.body, this.options.LINK_SELECTOR, 'mouseover', this.linkMouseoverHandler.bind(this))

        /**
         * popstate handler
         */
        window.addEventListener('popstate', this.popStateHandler.bind(this))

        /**
         * initial save to cache
         */
        var page = this.getDataFromHtml(document.documentElement.innerHTML)
        page.url = this.currentUrl
        if (this.options.cache) {
            this.cache.cacheUrl(page, this.options.debugMode)
        }

        /**
         * mark swup blocks in html
         */
        this.markSwupElements(document.documentElement)

        /**
         * trigger enabled event
         */
        this.triggerEvent('enabled')
        document.documentElement.classList.add('swup-enabled')

        /**
         * trigger page view event
         */
        this.triggerEvent('pageView')

        /**
         * preload pages if possible
         */
        this.preloadPages()
    }

    destroy () {
        // remove delegated listeners
        this.delegatedListeners.click.destroy()
        this.delegatedListeners.mouseover.destroy()

        // remove popstate listener
        window.removeEventListener('popstate', this.popStateHandler.bind(this))

        // empty cache
        this.cache.empty()

        // remove swup data atributes from blocks
        document.querySelectorAll('[data-swup]').forEach(element => {
            delete element.dataset.swup
        })

        this.triggerEvent('disabled')
        document.documentElement.classList.remove('swup-enabled')
    }

    linkClickHandler (event) {
        // no control key pressed
        if (!event.metaKey) {
            this.triggerEvent('clickLink')
            var link = new Link()
            event.preventDefault()
            link.setPath(event.delegateTarget.href)
            if (link.getAddress() == this.currentUrl || link.getAddress() == '') {
                if (link.getHash() != '') {
                    this.triggerEvent('samePageWithHash')
                    var element = document.querySelector(link.getHash())
                    if (element != null) {
                        if (this.options.scroll) {
                            let top = element.getBoundingClientRect().top + window.pageYOffset;
                            this.scrollTo(document.body, top)
                        }
                        history.replaceState(undefined, undefined, link.getHash())
                    } else {
                        console.warn(`Element for offset not found (${link.getHash()})`)
                    }
                } else {
                    this.triggerEvent('samePage')
                    if (this.options.scroll) {
                        this.scrollTo(document.body, 0, 1)
                    }
                }
            } else {
                if (link.getHash() != '') {
                    this.scrollToElement = link.getHash()
                }
                // custom class fro dynamic pages
                var swupClass = event.delegateTarget.dataset.swupClass
                if (swupClass != null) {
                    this.updateTransition(window.location.pathname, link.getAddress(), event.delegateTarget.dataset.swupClass)
                    document.documentElement.classList.add(`to-${swupClass}`)
                } else {
                    this.updateTransition(window.location.pathname, link.getAddress())
                }
                this.loadPage(link.getAddress(), false)
            }
        } else {
            this.triggerEvent('openPageInNewTab')
        }
    }

    linkMouseoverHandler (event) {
        this.triggerEvent('hoverLink')
        if (this.options.preload) {
            var link = new Link()
            link.setPath(event.delegateTarget.href)
            if (link.getAddress() != this.currentUrl && !this.cache.exists(link.getAddress()) && this.preloadPromise == null) {
                this.preloadPromise = new Promise(resolve => {
                    this.getPage(link.getAddress(), response => {
                        if (response === null) {
                            console.warn('Server error.')
                            this.triggerEvent('serverError')
                        } else {
                            // get json data
                            var page = this.getDataFromHtml(response)
                            page.url = link.getAddress()
                            this.cache.cacheUrl(page, this.options.debugMode)
                            this.triggerEvent('pagePreloaded')
                        }
                        resolve()
                        this.preloadPromise = null
                    })
                })
                this.preloadPromise.route = link.getAddress()
            }
        }
    }

    popStateHandler (event)  {
        var link = new Link()
        link.setPath(event.state ? event.state.url : window.location.pathname)
        if (link.getHash() != '') {
            this.scrollToElement = link.getHash()
        } else {
            event.preventDefault()
        }
        this.triggerEvent('popState')
        this.loadPage(link.getAddress(), event)
    }
}