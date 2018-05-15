(function webpackUniversalModuleDefinition(root, factory) {
	//Test Comment
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	//Test Comment
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	//Test Comment
	else if(typeof exports === 'object')
		exports["Swup"] = factory();
	//Test Comment
	else
		root["Swup"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./entry.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./entry.js":
/*!******************!*\
  !*** ./entry.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _index = __webpack_require__(/*! ./src/index.js */ \"./src/index.js\");\n\nvar _index2 = _interopRequireDefault(_index);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nmodule.exports = _index2.default; // this is here for webpack to expose Swup as window.Swup\n\n//# sourceURL=webpack://Swup/./entry.js?");

/***/ }),

/***/ "./node_modules/delegate/src/closest.js":
/*!**********************************************!*\
  !*** ./node_modules/delegate/src/closest.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var DOCUMENT_NODE_TYPE = 9;\n\n/**\n * A polyfill for Element.matches()\n */\nif (typeof Element !== 'undefined' && !Element.prototype.matches) {\n    var proto = Element.prototype;\n\n    proto.matches = proto.matchesSelector ||\n                    proto.mozMatchesSelector ||\n                    proto.msMatchesSelector ||\n                    proto.oMatchesSelector ||\n                    proto.webkitMatchesSelector;\n}\n\n/**\n * Finds the closest parent that matches a selector.\n *\n * @param {Element} element\n * @param {String} selector\n * @return {Function}\n */\nfunction closest (element, selector) {\n    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {\n        if (typeof element.matches === 'function' &&\n            element.matches(selector)) {\n          return element;\n        }\n        element = element.parentNode;\n    }\n}\n\nmodule.exports = closest;\n\n\n//# sourceURL=webpack://Swup/./node_modules/delegate/src/closest.js?");

/***/ }),

/***/ "./node_modules/delegate/src/delegate.js":
/*!***********************************************!*\
  !*** ./node_modules/delegate/src/delegate.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var closest = __webpack_require__(/*! ./closest */ \"./node_modules/delegate/src/closest.js\");\n\n/**\n * Delegates event to a selector.\n *\n * @param {Element} element\n * @param {String} selector\n * @param {String} type\n * @param {Function} callback\n * @param {Boolean} useCapture\n * @return {Object}\n */\nfunction delegate(element, selector, type, callback, useCapture) {\n    var listenerFn = listener.apply(this, arguments);\n\n    element.addEventListener(type, listenerFn, useCapture);\n\n    return {\n        destroy: function() {\n            element.removeEventListener(type, listenerFn, useCapture);\n        }\n    }\n}\n\n/**\n * Finds closest match and invokes callback.\n *\n * @param {Element} element\n * @param {String} selector\n * @param {String} type\n * @param {Function} callback\n * @return {Function}\n */\nfunction listener(element, selector, type, callback) {\n    return function(e) {\n        e.delegateTarget = closest(e.target, selector);\n\n        if (e.delegateTarget) {\n            callback.call(element, e);\n        }\n    }\n}\n\nmodule.exports = delegate;\n\n\n//# sourceURL=webpack://Swup/./node_modules/delegate/src/delegate.js?");

/***/ }),

/***/ "./node_modules/detectie/detectie.js":
/*!*******************************************!*\
  !*** ./node_modules/detectie/detectie.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n * detect IE\n * returns version of IE or false, if browser is not Internet Explorer\n */\nvar detectie = function() {\n    var ua = window.navigator.userAgent;\n\n    var msie = ua.indexOf('MSIE ');\n    if (msie > 0) {\n        // IE 10 or older => return version number\n        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);\n    }\n\n    var trident = ua.indexOf('Trident/');\n    if (trident > 0) {\n        // IE 11 => return version number\n        var rv = ua.indexOf('rv:');\n        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);\n    }\n\n    var edge = ua.indexOf('Edge/');\n    if (edge > 0) {\n       // IE 12 => return version number\n       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);\n    }\n    // other browser\n    return false;\n}\n\nmodule.exports = detectie;\n\n//# sourceURL=webpack://Swup/./node_modules/detectie/detectie.js?");

/***/ }),

/***/ "./src/Cache.js":
/*!**********************!*\
  !*** ./src/Cache.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Cache = function () {\n    function Cache() {\n        _classCallCheck(this, Cache);\n\n        this.pages = {};\n        this.count = 0;\n        this.last = null;\n    }\n\n    _createClass(Cache, [{\n        key: 'cacheUrl',\n        value: function cacheUrl(page, displayCache) {\n            this.count++;\n            if (page.url in this.pages === false) {\n                this.pages[page.url] = page;\n            }\n            this.last = this.pages[page.url];\n            if (displayCache) {\n                this.displayCache();\n            }\n        }\n    }, {\n        key: 'getPage',\n        value: function getPage(url) {\n            return this.pages[url];\n        }\n    }, {\n        key: 'displayCache',\n        value: function displayCache() {\n            console.groupCollapsed('Cache (' + Object.keys(this.pages).length + ')');\n            for (var key in this.pages) {\n                console.log(this.pages[key]);\n            }\n            console.groupEnd();\n        }\n    }, {\n        key: 'exists',\n        value: function exists(url) {\n            if (url in this.pages) return true;\n            return false;\n        }\n    }, {\n        key: 'empty',\n        value: function empty(showLog) {\n            this.pages = {};\n            this.count = 0;\n            this.last = null;\n            if (showLog) {\n                console.log('Cache cleared');\n            }\n        }\n    }]);\n\n    return Cache;\n}();\n\nexports.default = Cache;\n\n//# sourceURL=webpack://Swup/./src/Cache.js?");

/***/ }),

/***/ "./src/Link.js":
/*!*********************!*\
  !*** ./src/Link.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Link = function () {\n    function Link() {\n        _classCallCheck(this, Link);\n\n        this.link = document.createElement(\"a\");\n    }\n\n    _createClass(Link, [{\n        key: 'setPath',\n        value: function setPath(href) {\n            this.link.href = href;\n        }\n    }, {\n        key: 'getPath',\n        value: function getPath() {\n            var path = this.link.pathname;\n            if (path[0] != '/') {\n                path = '/' + path;\n            }\n            return path;\n        }\n    }, {\n        key: 'getAddress',\n        value: function getAddress() {\n            var path = this.link.pathname + this.link.search;\n            if (path[0] != '/') {\n                path = '/' + path;\n            }\n            return path;\n        }\n    }, {\n        key: 'getHash',\n        value: function getHash() {\n            return this.link.hash;\n        }\n    }]);\n\n    return Link;\n}();\n\nexports.default = Link;\n\n//# sourceURL=webpack://Swup/./src/Link.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\n\nvar _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\n// helpers\n\n\n// modules\n\n\nvar _delegate = __webpack_require__(/*! delegate */ \"./node_modules/delegate/src/delegate.js\");\n\nvar _delegate2 = _interopRequireDefault(_delegate);\n\nvar _detectie = __webpack_require__(/*! detectie */ \"./node_modules/detectie/detectie.js\");\n\nvar _detectie2 = _interopRequireDefault(_detectie);\n\nvar _Cache = __webpack_require__(/*! ./Cache */ \"./src/Cache.js\");\n\nvar _Cache2 = _interopRequireDefault(_Cache);\n\nvar _Link = __webpack_require__(/*! ./Link */ \"./src/Link.js\");\n\nvar _Link2 = _interopRequireDefault(_Link);\n\nvar _transitionEnd = __webpack_require__(/*! ./transitionEnd */ \"./src/transitionEnd.js\");\n\nvar _transitionEnd2 = _interopRequireDefault(_transitionEnd);\n\nvar _request = __webpack_require__(/*! ./modules/request */ \"./src/modules/request.js\");\n\nvar _request2 = _interopRequireDefault(_request);\n\nvar _getDataFromHtml = __webpack_require__(/*! ./modules/getDataFromHtml */ \"./src/modules/getDataFromHtml.js\");\n\nvar _getDataFromHtml2 = _interopRequireDefault(_getDataFromHtml);\n\nvar _loadPage = __webpack_require__(/*! ./modules/loadPage */ \"./src/modules/loadPage.js\");\n\nvar _loadPage2 = _interopRequireDefault(_loadPage);\n\nvar _renderPage = __webpack_require__(/*! ./modules/renderPage */ \"./src/modules/renderPage.js\");\n\nvar _renderPage2 = _interopRequireDefault(_renderPage);\n\nvar _goBack = __webpack_require__(/*! ./modules/goBack */ \"./src/modules/goBack.js\");\n\nvar _goBack2 = _interopRequireDefault(_goBack);\n\nvar _createState = __webpack_require__(/*! ./modules/createState */ \"./src/modules/createState.js\");\n\nvar _createState2 = _interopRequireDefault(_createState);\n\nvar _triggerEvent = __webpack_require__(/*! ./modules/triggerEvent */ \"./src/modules/triggerEvent.js\");\n\nvar _triggerEvent2 = _interopRequireDefault(_triggerEvent);\n\nvar _getUrl = __webpack_require__(/*! ./modules/getUrl */ \"./src/modules/getUrl.js\");\n\nvar _getUrl2 = _interopRequireDefault(_getUrl);\n\nvar _scrollTo = __webpack_require__(/*! ./modules/scrollTo */ \"./src/modules/scrollTo.js\");\n\nvar _scrollTo2 = _interopRequireDefault(_scrollTo);\n\nvar _classify = __webpack_require__(/*! ./modules/classify */ \"./src/modules/classify.js\");\n\nvar _classify2 = _interopRequireDefault(_classify);\n\nvar _doScrolling = __webpack_require__(/*! ./modules/doScrolling */ \"./src/modules/doScrolling.js\");\n\nvar _doScrolling2 = _interopRequireDefault(_doScrolling);\n\nvar _markSwupElements = __webpack_require__(/*! ./modules/markSwupElements */ \"./src/modules/markSwupElements.js\");\n\nvar _markSwupElements2 = _interopRequireDefault(_markSwupElements);\n\nvar _updateTransition = __webpack_require__(/*! ./modules/updateTransition */ \"./src/modules/updateTransition.js\");\n\nvar _updateTransition2 = _interopRequireDefault(_updateTransition);\n\nvar _preloadPages = __webpack_require__(/*! ./modules/preloadPages */ \"./src/modules/preloadPages.js\");\n\nvar _preloadPages2 = _interopRequireDefault(_preloadPages);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Swup = function () {\n    function Swup(setOptions) {\n        _classCallCheck(this, Swup);\n\n        // default options\n        var defaults = {\n            cache: true,\n            animationSelector: '[class^=\"a-\"]',\n            elements: ['#swup'],\n            pageClassPrefix: '',\n            debugMode: false,\n            scroll: true,\n            preload: true,\n            support: true,\n            disableIE: false,\n\n            animateScrollToAnchor: false,\n            animateScrollOnMobile: false,\n            doScrollingRightAway: false,\n            scrollDuration: 0,\n\n            LINK_SELECTOR: 'a[href^=\"/\"]:not([data-no-swup]), a[href^=\"#\"]:not([data-no-swup]), a[xlink\\\\:href]'\n\n            /**\n             * current transition object\n             */\n        };this.transition = {};\n\n        var options = _extends({}, defaults, setOptions);\n\n        /**\n         * helper variables\n         */\n        // mobile detection variable\n        this.mobile = false;\n        // id of element to scroll to after render\n        this.scrollToElement = null;\n        // promise used for preload, so no new loading of the same page starts while page is loading\n        this.preloadPromise = null;\n        // save options\n        this.options = options;\n\n        /**\n         * make modules accessible in instance\n         */\n        this.getUrl = _getUrl2.default;\n        this.cache = new _Cache2.default();\n        this.link = new _Link2.default();\n        this.transitionEndEvent = (0, _transitionEnd2.default)();\n        this.getDataFromHtml = _getDataFromHtml2.default;\n        this.getPage = _request2.default;\n        this.scrollTo = _scrollTo2.default;\n        this.loadPage = _loadPage2.default;\n        this.renderPage = _renderPage2.default;\n        this.goBack = _goBack2.default;\n        this.createState = _createState2.default;\n        this.triggerEvent = _triggerEvent2.default;\n        this.classify = _classify2.default;\n        this.doScrolling = _doScrolling2.default;\n        this.markSwupElements = _markSwupElements2.default;\n        this.updateTransition = _updateTransition2.default;\n        this.preloadPages = _preloadPages2.default;\n        this.detectie = _detectie2.default;\n        this.enable = this.enable;\n        this.destroy = this.destroy;\n\n        /**\n         * detect mobile devices\n         */\n        if (this.options.scroll) {\n            if (window.innerWidth <= 767) {\n                this.mobile = true;\n            }\n        }\n\n        // attach instance to window in debug mode\n        if (this.options.debugMode) {\n            window.swup = this;\n        }\n\n        this.getUrl();\n        this.enable();\n    }\n\n    _createClass(Swup, [{\n        key: 'enable',\n        value: function enable() {\n            /**\n             * support check\n             */\n            if (this.options.support) {\n                // check pushState support\n                if (!('pushState' in window.history)) {\n                    console.warn('pushState is not supported');\n                    return;\n                }\n                // check transitionEnd support\n                if ((0, _transitionEnd2.default)()) {\n                    this.transitionEndEvent = (0, _transitionEnd2.default)();\n                } else {\n                    console.warn('transitionEnd detection is not supported');\n                    return;\n                }\n                // check Promise support\n                if (typeof Promise === \"undefined\" || Promise.toString().indexOf(\"[native code]\") === -1) {\n                    console.warn('Promise is not supported');\n                    return;\n                }\n            }\n            /**\n             * disable IE\n             */\n            if (this.options.disableIE && this.detectie()) {\n                return;\n            }\n\n            // variable to keep event listeners from \"delegate\"\n            this.delegatedListeners = {};\n\n            /**\n             * link click handler\n             */\n            this.delegatedListeners.click = (0, _delegate2.default)(document, this.options.LINK_SELECTOR, 'click', this.linkClickHandler.bind(this));\n\n            /**\n             * link mouseover handler (preload)\n             */\n            this.delegatedListeners.mouseover = (0, _delegate2.default)(document.body, this.options.LINK_SELECTOR, 'mouseover', this.linkMouseoverHandler.bind(this));\n\n            /**\n             * popstate handler\n             */\n            window.addEventListener('popstate', this.popStateHandler.bind(this));\n\n            /**\n             * initial save to cache\n             */\n            var page = this.getDataFromHtml(document.documentElement.innerHTML);\n            page.url = this.currentUrl;\n            if (this.options.cache) {\n                this.cache.cacheUrl(page, this.options.debugMode);\n            }\n\n            /**\n             * mark swup blocks in html\n             */\n            this.markSwupElements(document.documentElement);\n\n            /**\n             * trigger enabled event\n             */\n            this.triggerEvent('enabled');\n            document.documentElement.classList.add('swup-enabled');\n\n            /**\n             * trigger page view event\n             */\n            this.triggerEvent('pageView');\n\n            /**\n             * preload pages if possible\n             */\n            this.preloadPages();\n        }\n    }, {\n        key: 'destroy',\n        value: function destroy() {\n            // remove delegated listeners\n            this.delegatedListeners.click.destroy();\n            this.delegatedListeners.mouseover.destroy();\n\n            // remove popstate listener\n            window.removeEventListener('popstate', this.popStateHandler.bind(this));\n\n            // empty cache\n            this.cache.empty();\n\n            // remove swup data atributes from blocks\n            document.querySelectorAll('[data-swup]').forEach(function (element) {\n                delete element.dataset.swup;\n            });\n\n            this.triggerEvent('disabled');\n            document.documentElement.classList.remove('swup-enabled');\n        }\n    }, {\n        key: 'linkClickHandler',\n        value: function linkClickHandler(event) {\n            // no control key pressed\n            if (!event.metaKey) {\n                this.triggerEvent('clickLink');\n                var link = new _Link2.default();\n                event.preventDefault();\n                link.setPath(event.delegateTarget.href);\n                if (link.getAddress() == this.currentUrl || link.getAddress() == '') {\n                    if (link.getHash() != '') {\n                        this.triggerEvent('samePageWithHash');\n                        var element = document.querySelector(link.getHash());\n                        if (element != null) {\n                            if (this.options.scroll) {\n                                this.scrollTo(document.body, element.offsetTop, 320);\n                            }\n                            history.replaceState(undefined, undefined, link.getHash());\n                        } else {\n                            console.warn('Element for offset not found (' + link.getHash() + ')');\n                        }\n                    } else {\n                        this.triggerEvent('samePage');\n                        if (this.options.scroll) {\n                            this.scrollTo(document.body, 0, 320);\n                        }\n                    }\n                } else {\n                    if (link.getHash() != '') {\n                        this.scrollToElement = link.getHash();\n                    }\n                    // custom class fro dynamic pages\n                    var swupClass = event.delegateTarget.dataset.swupClass;\n                    if (swupClass != null) {\n                        this.updateTransition(window.location.pathname, link.getAddress(), event.delegateTarget.dataset.swupClass);\n                        document.documentElement.classList.add('to-' + swupClass);\n                    } else {\n                        this.updateTransition(window.location.pathname, link.getAddress());\n                    }\n                    this.loadPage(link.getAddress(), false);\n                }\n            } else {\n                this.triggerEvent('openPageInNewTab');\n            }\n        }\n    }, {\n        key: 'linkMouseoverHandler',\n        value: function linkMouseoverHandler(event) {\n            var _this = this;\n\n            this.triggerEvent('hoverLink');\n            if (this.options.preload) {\n                var link = new _Link2.default();\n                link.setPath(event.delegateTarget.href);\n                if (link.getAddress() != this.currentUrl && !this.cache.exists(link.getAddress()) && this.preloadPromise == null) {\n                    this.preloadPromise = new Promise(function (resolve) {\n                        _this.getPage(link.getAddress(), function (response) {\n                            if (response === null) {\n                                console.warn('Server error.');\n                                _this.triggerEvent('serverError');\n                            } else {\n                                // get json data\n                                var page = _this.getDataFromHtml(response);\n                                page.url = link.getAddress();\n                                _this.cache.cacheUrl(page, _this.options.debugMode);\n                                _this.triggerEvent('pagePreloaded');\n                            }\n                            resolve();\n                            _this.preloadPromise = null;\n                        });\n                    });\n                    this.preloadPromise.route = link.getAddress();\n                }\n            }\n        }\n    }, {\n        key: 'popStateHandler',\n        value: function popStateHandler(event) {\n            var link = new _Link2.default();\n            link.setPath(event.state ? event.state.url : window.location.pathname);\n            if (link.getHash() != '') {\n                this.scrollToElement = link.getHash();\n            } else {\n                event.preventDefault();\n            }\n            this.triggerEvent('popState');\n            this.loadPage(link.getAddress(), event);\n        }\n    }]);\n\n    return Swup;\n}();\n\nexports.default = Swup;\n\n//# sourceURL=webpack://Swup/./src/index.js?");

/***/ }),

/***/ "./src/modules/classify.js":
/*!*********************************!*\
  !*** ./src/modules/classify.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (text) {\n    var output = text.toString().toLowerCase().replace(/\\s+/g, '-') // Replace spaces with -\n    .replace(/\\//g, '-') // Replace / with -\n    .replace(/[^\\w\\-]+/g, '') // Remove all non-word chars\n    .replace(/\\-\\-+/g, '-') // Replace multiple - with single -\n    .replace(/^-+/, '') // Trim - from start of text\n    .replace(/-+$/, ''); // Trim - from end of text\n    if (output[0] == \"/\") output = output.splice(1);\n    if (output == '') output = 'homepage';\n    return output;\n};\n\n//# sourceURL=webpack://Swup/./src/modules/classify.js?");

/***/ }),

/***/ "./src/modules/createState.js":
/*!************************************!*\
  !*** ./src/modules/createState.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (url) {\n    window.history.pushState({\n        url: url || window.location.href.split(window.location.hostname)[1],\n        random: Math.random()\n    }, document.getElementsByTagName('title')[0].innerText, url || window.location.href.split(window.location.hostname)[1]);\n};\n\n//# sourceURL=webpack://Swup/./src/modules/createState.js?");

/***/ }),

/***/ "./src/modules/doScrolling.js":
/*!************************************!*\
  !*** ./src/modules/doScrolling.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (popstate) {\n    if (this.options.scroll && !popstate) {\n        if (this.scrollToElement != null) {\n            var self = this;\n\n            var element = document.querySelector(self.scrollToElement);\n            if (element != null) {\n                if (self.animateScrollToAnchor) {\n                    self.scrollTo(document.body, element.offsetTop, this.options.scrollDuration);\n                } else {\n                    self.scrollTo(document.body, element.offsetTop, 20);\n                }\n            } else {\n                console.warn(\"Element for offset not found (\" + self.scrollToElement + \")\");\n            }\n            self.scrollToElement = null;\n        } else {\n            if (this.mobile && !this.options.animateScrollOnMobile) {\n                this.scrollTo(document.body, 0, 0);\n            } else if (this.mobile && this.options.animateScrollOnMobile) {\n                this.scrollTo(document.body, 0, this.options.scrollDuration);\n            } else {\n                this.scrollTo(document.body, 0, this.options.scrollDuration);\n            }\n        }\n    }\n};\n\n//# sourceURL=webpack://Swup/./src/modules/doScrolling.js?");

/***/ }),

/***/ "./src/modules/getDataFromHtml.js":
/*!****************************************!*\
  !*** ./src/modules/getDataFromHtml.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (html) {\n    var _this = this;\n\n    var content = html.replace('<body', '<div id=\"swupBody\"').replace('</body>', '</div>');\n    var fakeDom = document.createElement('div');\n    fakeDom.innerHTML = content;\n    var blocks = [];\n\n    for (var i = 0; i < this.options.elements.length; i++) {\n        if (fakeDom.querySelector(this.options.elements[i]) == null) {\n            console.warn('Element ' + this.options.elements[i] + ' is not found cached page.');\n        } else {\n            [].forEach.call(document.body.querySelectorAll(this.options.elements[i]), function (item, index) {\n                fakeDom.querySelectorAll(_this.options.elements[i])[index].dataset.swup = blocks.length;\n                blocks.push(fakeDom.querySelectorAll(_this.options.elements[i])[index].outerHTML);\n            });\n        }\n    }\n\n    var json = {\n        title: fakeDom.querySelector('title').innerText,\n        pageClass: fakeDom.querySelector('#swupBody').className,\n        originalContent: html,\n        blocks: blocks\n    };\n    return json;\n};\n\n//# sourceURL=webpack://Swup/./src/modules/getDataFromHtml.js?");

/***/ }),

/***/ "./src/modules/getUrl.js":
/*!*******************************!*\
  !*** ./src/modules/getUrl.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function () {\n    this.currentUrl = window.location.pathname + window.location.search;\n};\n\n//# sourceURL=webpack://Swup/./src/modules/getUrl.js?");

/***/ }),

/***/ "./src/modules/goBack.js":
/*!*******************************!*\
  !*** ./src/modules/goBack.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (page, popstate) {\n    setTimeout(function () {\n        document.body.classList.remove('is-changing');\n        history.back();\n    }, 100);\n};\n\n//# sourceURL=webpack://Swup/./src/modules/goBack.js?");

/***/ }),

/***/ "./src/modules/loadPage.js":
/*!*********************************!*\
  !*** ./src/modules/loadPage.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar forEach = Array.prototype.forEach;\n\n\nmodule.exports = function (url, popstate) {\n    var _this = this;\n\n    var finalPage = null;\n\n    // scrolling\n    if (this.options.doScrollingRightAway && !this.scrollToElement) {\n        this.doScrolling(popstate);\n    }\n\n    var animationPromises = [];\n\n    if (!popstate) {\n        // start animation\n        document.documentElement.classList.add('is-changing');\n        document.documentElement.classList.add('is-leaving');\n        document.documentElement.classList.add('is-animating');\n        document.documentElement.classList.add('to-' + this.classify(url));\n\n        // detect animation end\n        var animatedElements = document.querySelectorAll(this.options.animationSelector);\n        forEach.call(animatedElements, function (element) {\n            var promise = new Promise(function (resolve) {\n                element.addEventListener(_this.transitionEndEvent, resolve);\n            });\n            animationPromises.push(promise);\n        });\n\n        Promise.all(animationPromises).then(function () {\n            _this.triggerEvent('animationOutDone');\n        });\n\n        // create pop element with or without anchor\n        if (this.scrollToElement != null) {\n            var pop = url + this.scrollToElement;\n        } else {\n            var pop = url;\n        }\n        this.createState(pop);\n    } else {\n        // proceed without animating\n        this.triggerEvent('animationSkipped');\n    }\n\n    if (this.cache.exists(url)) {\n        var xhrPromise = new Promise(function (resolve) {\n            resolve();\n        });\n        this.triggerEvent('pageRetrievedFromCache');\n    } else {\n        if (!this.preloadPromise || this.preloadPromise.route != url) {\n            var xhrPromise = new Promise(function (resolve) {\n                _this.getPage(url, function (response) {\n                    if (response === null) {\n                        console.warn('Server error.');\n                        _this.triggerEvent('serverError');\n                        _this.goBack();\n                    } else {\n                        // get json data\n                        var page = _this.getDataFromHtml(response);\n                        page.url = url;\n                        // render page\n                        _this.cache.cacheUrl(page, _this.options.debugMode);\n                        _this.triggerEvent('pageLoaded');\n                    }\n                    resolve();\n                });\n            });\n        } else {\n            var xhrPromise = this.preloadPromise;\n        }\n    }\n\n    Promise.all(animationPromises.concat([xhrPromise])).then(function () {\n        finalPage = _this.cache.getPage(url);\n        if (!_this.options.cache) {\n            _this.cache.empty(_this.options.debugMode);\n        }\n        _this.renderPage(finalPage, popstate);\n        _this.preloadPromise = null;\n    });\n};\n\n//# sourceURL=webpack://Swup/./src/modules/loadPage.js?");

/***/ }),

/***/ "./src/modules/markSwupElements.js":
/*!*****************************************!*\
  !*** ./src/modules/markSwupElements.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (element) {\n    var _this = this;\n\n    var blocks = 0;\n\n    for (var i = 0; i < this.options.elements.length; i++) {\n        if (element.querySelector(this.options.elements[i]) == null) {\n            console.warn(\"Element \" + this.options.elements[i] + \" is not in current page.\");\n        } else {\n            [].forEach.call(document.body.querySelectorAll(this.options.elements[i]), function (item, index) {\n                element.querySelectorAll(_this.options.elements[i])[index].dataset.swup = blocks;\n                blocks++;\n            });\n        }\n    }\n};\n\n//# sourceURL=webpack://Swup/./src/modules/markSwupElements.js?");

/***/ }),

/***/ "./src/modules/preloadPages.js":
/*!*************************************!*\
  !*** ./src/modules/preloadPages.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _Link = __webpack_require__(/*! ../Link */ \"./src/Link.js\");\n\nvar _Link2 = _interopRequireDefault(_Link);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nmodule.exports = function (eventName) {\n    var _this = this;\n\n    if (this.options.preload) {\n        var preload = function preload(pathname) {\n            var link = new _Link2.default();\n            link.setPath(pathname);\n            if (link.getAddress() != _this.currentUrl && !_this.cache.exists(link.getAddress()) && _this.preloadPromise == null) {\n                _this.getPage(link.getAddress(), function (response) {\n                    if (response === null) {\n                        console.warn('Server error.');\n                        _this.triggerEvent('serverError');\n                    } else {\n                        // get json data\n                        var page = _this.getDataFromHtml(response);\n                        page.url = link.getAddress();\n                        _this.cache.cacheUrl(page, _this.options.debugMode);\n                        _this.triggerEvent('pagePreloaded');\n                    }\n                });\n            }\n        };\n\n        document.querySelectorAll('[data-swup-preload]').forEach(function (element) {\n            preload(element.href);\n        });\n    }\n};\n\n//# sourceURL=webpack://Swup/./src/modules/preloadPages.js?");

/***/ }),

/***/ "./src/modules/renderPage.js":
/*!***********************************!*\
  !*** ./src/modules/renderPage.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar forEach = Array.prototype.forEach;\n\n\nmodule.exports = function (page, popstate) {\n    var _this = this;\n\n    document.documentElement.classList.remove('is-leaving');\n\n    // only add for non-popstate transitions\n    if (!popstate) {\n        document.documentElement.classList.add('is-rendering');\n    }\n\n    // replace blocks\n    for (var i = 0; i < page.blocks.length; i++) {\n        document.body.querySelector('[data-swup=\"' + i + '\"]').outerHTML = page.blocks[i];\n    }\n\n    // set title\n    document.title = page.title;\n\n    this.triggerEvent('contentReplaced');\n    this.triggerEvent('pageView');\n    setTimeout(function () {\n        document.documentElement.classList.remove('is-animating');\n    }, 10);\n\n    // handle classes after render\n    if (this.options.pageClassPrefix !== false) {\n        document.body.className.split(' ').forEach(function (className) {\n            // empty string for page class\n            if (className != \"\" && className.includes(_this.options.pageClassPrefix)) {\n                document.body.classList.remove(className);\n            }\n        });\n    }\n\n    // empty string for page class\n    if (page.pageClass != \"\") {\n        page.pageClass.split(' ').forEach(function (className) {\n            document.body.classList.add(className);\n        });\n    }\n\n    // scrolling\n    if (!this.options.doScrollingRightAway || this.scrollToElement) {\n        this.doScrolling(popstate);\n    }\n\n    // detect animation end\n    var animatedElements = document.querySelectorAll(this.options.animationSelector);\n    var promises = [];\n    forEach.call(animatedElements, function (element) {\n        var promise = new Promise(function (resolve) {\n            element.addEventListener(_this.transitionEndEvent, resolve);\n        });\n        promises.push(promise);\n    });\n\n    //preload pages if possible\n    this.preloadPages();\n\n    Promise.all(promises).then(function () {\n        _this.triggerEvent('animationInDone');\n        // remove \"to-{page}\" classes\n        document.documentElement.classList.forEach(function (classItem) {\n            if (classItem.startsWith('to-')) {\n                document.documentElement.classList.remove(classItem);\n            }\n        });\n        document.documentElement.classList.remove('is-changing');\n        document.documentElement.classList.remove('is-rendering');\n    });\n\n    // update current url\n    this.getUrl();\n};\n\n//# sourceURL=webpack://Swup/./src/modules/renderPage.js?");

/***/ }),

/***/ "./src/modules/request.js":
/*!********************************!*\
  !*** ./src/modules/request.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (location, callback) {\n    var request = new XMLHttpRequest();\n\n    request.onreadystatechange = function () {\n        if (request.readyState === 4) {\n            if (request.status !== 500) {\n                callback(request.responseText, request);\n            } else {\n                callback(null, request);\n            }\n        }\n    };\n\n    request.open(\"GET\", location, true);\n    request.setRequestHeader(\"X-Requested-With\", \"swup\");\n    request.send(null);\n    return request;\n};\n\n//# sourceURL=webpack://Swup/./src/modules/request.js?");

/***/ }),

/***/ "./src/modules/scrollTo.js":
/*!*********************************!*\
  !*** ./src/modules/scrollTo.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (element, to, duration) {\n    var _this = this;\n\n    var body = document.body;\n\n    var UP = -1;\n    var DOWN = 1;\n\n    var friction = 0.7;\n    var acceleration = 0.04;\n\n    var positionY = 100;\n    var velocityY = 0;\n    var targetPositionY = 400;\n\n    var raf = null;\n\n    function getScrollTop() {\n        return document.body.scrollTop || document.documentElement.scrollTop;\n    }\n\n    var animate = function animate() {\n        var distance = update();\n        render();\n\n        if (Math.abs(distance) > 0.1) {\n            raf = requestAnimationFrame(animate);\n        } else {\n            _this.triggerEvent('scrollDone');\n        }\n    };\n\n    function update() {\n        var distance = targetPositionY - positionY;\n        var attraction = distance * acceleration;\n\n        applyForce(attraction);\n\n        velocityY *= friction;\n        positionY += velocityY;\n\n        return distance;\n    }\n\n    var applyForce = function applyForce(force) {\n        velocityY += force;\n    };\n\n    var render = function render() {\n        window.scrollTo(0, positionY);\n    };\n\n    window.addEventListener('mousewheel', function (event) {\n        if (raf) {\n            cancelAnimationFrame(raf);\n            raf = null;\n        }\n    }, {\n        passive: true\n    });\n\n    var scrollTo = function scrollTo(offset, callback) {\n        positionY = getScrollTop();\n        targetPositionY = offset;\n        velocityY = 0;\n        animate();\n    };\n\n    this.triggerEvent('scrollStart');\n    if (duration == 0) {\n        window.scrollTo(0, 0);\n        this.triggerEvent('scrollDone');\n    } else {\n        scrollTo(to);\n    }\n};\n\n//# sourceURL=webpack://Swup/./src/modules/scrollTo.js?");

/***/ }),

/***/ "./src/modules/triggerEvent.js":
/*!*************************************!*\
  !*** ./src/modules/triggerEvent.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (eventName) {\n    if (this.options.debugMode) {\n        console.log('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD');\n    }\n    var event = new CustomEvent('swup:' + eventName, { detail: eventName });\n    document.dispatchEvent(event);\n};\n\n//# sourceURL=webpack://Swup/./src/modules/triggerEvent.js?");

/***/ }),

/***/ "./src/modules/updateTransition.js":
/*!*****************************************!*\
  !*** ./src/modules/updateTransition.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function (from, to, custom) {\n\n    // homepage case\n    if (from == \"/\") {\n        from = \"/homepage\";\n    }\n    if (to == \"/\") {\n        to = \"/homepage\";\n    }\n\n    // transition routes\n    this.transition = {\n        from: from.replace('/', ''),\n        to: to.replace('/', '')\n    };\n\n    if (custom) {\n        this.transition.custom = custom;\n    }\n};\n\n//# sourceURL=webpack://Swup/./src/modules/updateTransition.js?");

/***/ }),

/***/ "./src/transitionEnd.js":
/*!******************************!*\
  !*** ./src/transitionEnd.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = function transitionEnd() {\n    var el = document.createElement('div');\n\n    var transEndEventNames = {\n        WebkitTransition: 'webkitTransitionEnd',\n        MozTransition: 'transitionend',\n        OTransition: 'oTransitionEnd otransitionend',\n        transition: 'transitionend'\n    };\n\n    for (var name in transEndEventNames) {\n        if (el.style[name] !== undefined) {\n            return transEndEventNames[name];\n        }\n    }\n\n    return false;\n};\n\n//# sourceURL=webpack://Swup/./src/transitionEnd.js?");

/***/ })

/******/ });
});