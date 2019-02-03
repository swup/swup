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
import createState from './modules/createState'
import triggerEvent from './modules/triggerEvent'
import getUrl from './modules/getUrl'
import scrollTo from './modules/scrollTo'
import classify from './modules/classify'
import doScrolling from './modules/doScrolling'
import markSwupElements from './modules/markSwupElements'
import on from './modules/on'
import off from './modules/off'
import updateTransition from './modules/updateTransition'
import preloadPage from './modules/preloadPage'
import preloadPages from './modules/preloadPages'
import usePlugin from './modules/usePlugin'
import log from './modules/log'
import { queryAll } from './modules/utils'

export default class Swup {
    constructor(setOptions) {
        // default options
        let defaults = {
            cache: true,
            animationSelector: '[class*="transition-"]',
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
            plugins: [],

            skipPopStateHandling: function(event){
                if (event.state && event.state.source == "swup") {
                    return false;
                }
                return true;
            },
            animateHistoryBrowsing: false,

            LINK_SELECTOR: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
            FORM_SELECTOR: 'form[data-swup-form]',
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
         * handler arrays
         */
        this._handlers = {
            animationInDone: [],
            animationInStart: [],
            animationOutDone: [],
            animationOutStart: [],
            animationSkipped: [],
            clickLink: [],
            contentReplaced: [],
            disabled: [],
            enabled: [],
            hoverLink: [],
            openPageInNewTab: [],
            pageLoaded: [],
            pagePreloaded: [],
            pageRetrievedFromCache: [],
            pageView: [],
            popState: [],
            samePage: [],
            samePageWithHash: [],
            scrollDone: [],
            scrollStart: [],
            serverError: [],
            submitForm: [],
            willReplaceContent: [],
        };

        /**
         * helper variables
         */
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
        this.createState = createState
        this.triggerEvent = triggerEvent
        this.classify = classify
        this.doScrolling = doScrolling
        this.markSwupElements = markSwupElements
        this.on = on
        this.off = off
        this.updateTransition = updateTransition
        this.preloadPage = preloadPage
        this.preloadPages = preloadPages
        this.usePlugin = usePlugin
        this.log = log
        this.enable = this.enable
        this.destroy = this.destroy

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
         * form submit handler
         */
        this.delegatedListeners.formSubmit = delegate(document, this.options.FORM_SELECTOR, 'submit', this.formSubmitHandler.bind(this))

        /**
         * popstate handler
         */
        window.addEventListener('popstate', this.popStateHandler.bind(this))

        /**
         * initial save to cache
         */
        var page = this.getDataFromHtml(document.documentElement.outerHTML)
        page.url = this.currentUrl
        if (this.options.cache) {
            this.cache.cacheUrl(page, this.options.debugMode)
        }

        /**
         * mark swup blocks in html
         */
        this.markSwupElements(document.documentElement)

        /**
         * enable plugins from options
         */
        this.options.plugins.forEach(item => this.usePlugin(item))

        /**
         * modify initial history record
         */
        window.history.replaceState(
            Object.assign({}, window.history.state, {
                url: window.location.href,
                random: Math.random(),
                source: "swup",
            }),
            document.title,
            window.location.href
        );

        /**
         * Disable browser scroll control on popstates when animateHistoryBrowsing option is enabled
         */
        if (this.options.animateHistoryBrowsing) {
            window.history.scrollRestoration = "manual"
        }

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
        queryAll('[data-swup]').forEach(element => {
            delete element.dataset.swup
        })

        // remove handlers
        this.off();

        this.triggerEvent('disabled')
        document.documentElement.classList.remove('swup-enabled')

    }

    linkClickHandler (event) {
        // no control key pressed
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            // index of pressed button needs to be checked because Firefox triggers click on all mouse buttons
            if (event.button === 0) {
                this.triggerEvent('clickLink', event)
                var link = new Link()
                event.preventDefault()
                link.setPath(event.delegateTarget.href)

                if (link.getAddress() == this.currentUrl || link.getAddress() == '') {
                    // link to the same URL
                    if (link.getHash() != '') {
                        // link to the same URL with hash
                        this.triggerEvent('samePageWithHash', event)
                        var element = document.querySelector(link.getHash())
                        if (element != null) {
                            // referenced element found
                            if (this.options.scroll) {
                                let top = element.getBoundingClientRect().top + window.pageYOffset;
                                this.scrollTo(document.body, top)
                            }
                            history.replaceState({
                                    url: link.getAddress() + link.getHash(),
                                    random: Math.random(),
                                    source: "swup",
                                },
                                document.title,
                                link.getAddress() + link.getHash()
                            )
                        } else {
                            // referenced element not found
                            console.warn(`Element for offset not found (${link.getHash()})`)
                        }
                    } else {
                        // link to the same URL without hash
                        this.triggerEvent('samePage', event)
                        if (this.options.scroll) {
                            this.scrollTo(document.body, 0, 1)
                        }
                    }
                } else {
                    // link to different url
                    if (link.getHash() != '') {
                        this.scrollToElement = link.getHash()
                    }

                    // get custom transition from data
                    let customTransition = event.delegateTarget.dataset.swupTransition;

                    // load page
                    this.loadPage({ url: link.getAddress(), customTransition: customTransition }, false)
                }
            }
        } else {
            // open in new tab (do nothing)
            this.triggerEvent('openPageInNewTab', event)
        }
    }

    linkMouseoverHandler (event) {
        this.triggerEvent('hoverLink', event)
        if (this.options.preload) {
            var link = new Link()
            link.setPath(event.delegateTarget.href)
            if (link.getAddress() != this.currentUrl && !this.cache.exists(link.getAddress()) && this.preloadPromise == null) {
                this.preloadPromise = new Promise((resolve, reject) => {
                    this.getPage({ url: link.getAddress() },  (response, request) => {
                        if (request.status === 500) {
                            this.triggerEvent('serverError', event)
                            reject(link.getAddress())
                            return;
                        } else {
                            // get json data
                            var page = this.getDataFromHtml(response, request)
                            if (page != null) {
                                page.url = link.getAddress()
                                this.cache.cacheUrl(page, this.options.debugMode)
                                this.triggerEvent('pagePreloaded', event)
                            } else {
                                reject(link.getAddress())
                                return;
                            }
                        }
                        resolve()
                        this.preloadPromise = null
                    })
                })
                this.preloadPromise.route = link.getAddress()
            }
        }
    }

    formSubmitHandler (event) {
        // no control key pressed
        if (!event.metaKey) {
            this.triggerEvent('submitForm', event)
            event.preventDefault()
            let form = event.target
            let formData  = new FormData(form)

            let link = new Link()
            link.setPath(form.action)

            if (link.getHash() != '') {
                this.scrollToElement = link.getHash()
            }

            if(form.method.toLowerCase() != "get") {
                // remove page from cache
                this.cache.remove(link.getAddress())

                // send data
                this.loadPage({
                    url: link.getAddress(),
                    method: form.method,
                    data: formData,
                })
            } else {
                // create base url
                let url = link.getAddress() || window.location.href
                let inputs = queryAll('input, select', form)
                if(url.indexOf('?') == -1) {
                    url += "?"
                } else {
                    url += "&"
                }

                // add form data to url
                inputs.forEach(input => {
                    if(input.type == "checkbox" || input.type == "radio") {
                        if(input.checked) {
                            url += encodeURIComponent(input.name) + "=" + encodeURIComponent(input.value) + "&";
                        }
                    } else {
                        url += encodeURIComponent(input.name) + "=" + encodeURIComponent(input.value) + "&";
                    }
                })

                // remove last "&"
                url = url.slice(0, -1)

                // remove page from cache
                this.cache.remove(url)

                // send data
                this.loadPage({
                    url: url,
                })
            }
        } else {
            this.triggerEvent('openFormSubmitInNewTab', event)
        }
    }

    popStateHandler (event)  {
        var link = new Link()
        if (this.options.skipPopStateHandling(event)) return;
        link.setPath(event.state ? event.state.url : window.location.pathname)
        if (link.getHash() != '') {
            this.scrollToElement = link.getHash()
        } else {
            event.preventDefault()
        }
        this.triggerEvent('popState', event)
        this.loadPage({ url: link.getAddress() }, event)
    }
}
