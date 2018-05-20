(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Swup"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = 21);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Link = function () {
    function Link() {
        _classCallCheck(this, Link);

        this.link = document.createElement("a");
    }

    _createClass(Link, [{
        key: 'setPath',
        value: function setPath(href) {
            this.link.href = href;
        }
    }, {
        key: 'getPath',
        value: function getPath() {
            var path = this.link.pathname;
            if (path[0] != '/') {
                path = '/' + path;
            }
            return path;
        }
    }, {
        key: 'getAddress',
        value: function getAddress() {
            var path = this.link.pathname + this.link.search;
            if (path[0] != '/') {
                path = '/' + path;
            }
            return path;
        }
    }, {
        key: 'getHash',
        value: function getHash() {
            return this.link.hash;
        }
    }]);

    return Link;
}();

exports.default = Link;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Link = __webpack_require__(0);

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (eventName) {
    var _this = this;

    if (this.options.preload) {
        var preload = function preload(pathname) {
            var link = new _Link2.default();
            link.setPath(pathname);
            if (link.getAddress() != _this.currentUrl && !_this.cache.exists(link.getAddress()) && _this.preloadPromise == null) {
                _this.getPage(link.getAddress(), function (response) {
                    if (response === null) {
                        console.warn('Server error.');
                        _this.triggerEvent('serverError');
                    } else {
                        // get json data
                        var page = _this.getDataFromHtml(response);
                        page.url = link.getAddress();
                        _this.cache.cacheUrl(page, _this.options.debugMode);
                        _this.triggerEvent('pagePreloaded');
                    }
                });
            }
        };

        document.querySelectorAll('[data-swup-preload]').forEach(function (element) {
            preload(element.href);
        });
    }
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (from, to, custom) {

    // homepage case
    if (from == "/") {
        from = "/homepage";
    }
    if (to == "/") {
        to = "/homepage";
    }

    // transition routes
    this.transition = {
        from: from.replace('/', ''),
        to: to.replace('/', '')
    };

    if (custom) {
        this.transition.custom = custom;
    }
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (element) {
    var _this = this;

    var blocks = 0;

    for (var i = 0; i < this.options.elements.length; i++) {
        if (element.querySelector(this.options.elements[i]) == null) {
            console.warn("Element " + this.options.elements[i] + " is not in current page.");
        } else {
            [].forEach.call(document.body.querySelectorAll(this.options.elements[i]), function (item, index) {
                element.querySelectorAll(_this.options.elements[i])[index].dataset.swup = blocks;
                blocks++;
            });
        }
    }
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (popstate) {
    if (this.options.scroll && !popstate) {
        if (this.scrollToElement != null) {
            var self = this;

            var element = document.querySelector(self.scrollToElement);
            if (element != null) {
                var top = element.getBoundingClientRect().top + window.pageYOffset;
                self.scrollTo(document.body, top);
            } else {
                console.warn("Element for offset not found (" + self.scrollToElement + ")");
            }
            self.scrollToElement = null;
        } else {
            this.scrollTo(document.body, 0);
        }
    }
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (text) {
    var output = text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
    .replace(/\//g, '-') // Replace / with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
    if (output[0] == "/") output = output.splice(1);
    if (output == '') output = 'homepage';
    return output;
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (element, to) {
    var _this = this;

    var animatedScroll = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.options.animateScroll;

    var body = document.body;

    var UP = -1;
    var DOWN = 1;

    var friction = 1 - this.options.scrollFriction;
    var acceleration = this.options.scrollAcceleration;

    var positionY = 100;
    var velocityY = 0;
    var targetPositionY = 400;

    var raf = null;

    function getScrollTop() {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }

    var animate = function animate() {
        var distance = update();
        render();

        if (Math.abs(distance) > 0.1) {
            raf = requestAnimationFrame(animate);
        } else {
            _this.triggerEvent('scrollDone');
        }
    };

    function update() {
        var distance = targetPositionY - positionY;
        var attraction = distance * acceleration;

        applyForce(attraction);

        velocityY *= friction;
        positionY += velocityY;

        return distance;
    }

    var applyForce = function applyForce(force) {
        velocityY += force;
    };

    var render = function render() {
        window.scrollTo(0, positionY);
    };

    window.addEventListener('mousewheel', function (event) {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
        }
    }, {
        passive: true
    });

    var scrollTo = function scrollTo(offset, callback) {
        positionY = getScrollTop();
        targetPositionY = offset;
        velocityY = 0;
        animate();
    };

    this.triggerEvent('scrollStart');
    if (animatedScroll == 0) {
        window.scrollTo(0, to);
        this.triggerEvent('scrollDone');
    } else {
        scrollTo(to);
    }
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
    this.currentUrl = window.location.pathname + window.location.search;
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (eventName) {
    if (this.options.debugMode) {
        console.log('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD');
    }
    var event = new CustomEvent('swup:' + eventName, { detail: eventName });
    document.dispatchEvent(event);
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (url) {
    window.history.pushState({
        url: url || window.location.href.split(window.location.hostname)[1],
        random: Math.random()
    }, document.getElementsByTagName('title')[0].innerText, url || window.location.href.split(window.location.hostname)[1]);
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (page, popstate) {
    setTimeout(function () {
        document.body.classList.remove('is-changing');
        history.back();
    }, 100);
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var forEach = Array.prototype.forEach;


module.exports = function (page, popstate) {
    var _this = this;

    document.documentElement.classList.remove('is-leaving');

    // only add for non-popstate transitions
    if (!popstate) {
        document.documentElement.classList.add('is-rendering');
    }

    // replace blocks
    for (var i = 0; i < page.blocks.length; i++) {
        document.body.querySelector('[data-swup="' + i + '"]').outerHTML = page.blocks[i];
    }

    // set title
    document.title = page.title;

    this.triggerEvent('contentReplaced');
    this.triggerEvent('pageView');
    setTimeout(function () {
        document.documentElement.classList.remove('is-animating');
    }, 10);

    // handle classes after render
    if (this.options.pageClassPrefix !== false) {
        document.body.className.split(' ').forEach(function (className) {
            // empty string for page class
            if (className != "" && className.includes(_this.options.pageClassPrefix)) {
                document.body.classList.remove(className);
            }
        });
    }

    // empty string for page class
    if (page.pageClass != "") {
        page.pageClass.split(' ').forEach(function (className) {
            document.body.classList.add(className);
        });
    }

    // scrolling
    if (!this.options.doScrollingRightAway || this.scrollToElement) {
        this.doScrolling(popstate);
    }

    // detect animation end
    var animatedElements = document.querySelectorAll(this.options.animationSelector);
    var promises = [];
    forEach.call(animatedElements, function (element) {
        var promise = new Promise(function (resolve) {
            element.addEventListener(_this.transitionEndEvent, resolve);
        });
        promises.push(promise);
    });

    //preload pages if possible
    this.preloadPages();

    Promise.all(promises).then(function () {
        _this.triggerEvent('animationInDone');
        // remove "to-{page}" classes
        document.documentElement.classList.forEach(function (classItem) {
            if (classItem.startsWith('to-')) {
                document.documentElement.classList.remove(classItem);
            }
        });
        document.documentElement.classList.remove('is-changing');
        document.documentElement.classList.remove('is-rendering');
    });

    // update current url
    this.getUrl();
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var forEach = Array.prototype.forEach;


module.exports = function (url, popstate) {
    var _this = this;

    var finalPage = null;

    // scrolling
    if (this.options.doScrollingRightAway && !this.scrollToElement) {
        this.doScrolling(popstate);
    }

    var animationPromises = [];

    if (!popstate) {
        // start animation
        document.documentElement.classList.add('is-changing');
        document.documentElement.classList.add('is-leaving');
        document.documentElement.classList.add('is-animating');
        document.documentElement.classList.add('to-' + this.classify(url));

        // detect animation end
        var animatedElements = document.querySelectorAll(this.options.animationSelector);
        forEach.call(animatedElements, function (element) {
            var promise = new Promise(function (resolve) {
                element.addEventListener(_this.transitionEndEvent, resolve);
            });
            animationPromises.push(promise);
        });

        Promise.all(animationPromises).then(function () {
            _this.triggerEvent('animationOutDone');
        });

        // create pop element with or without anchor
        if (this.scrollToElement != null) {
            var pop = url + this.scrollToElement;
        } else {
            var pop = url;
        }
        this.createState(pop);
    } else {
        // proceed without animating
        this.triggerEvent('animationSkipped');
    }

    if (this.cache.exists(url)) {
        var xhrPromise = new Promise(function (resolve) {
            resolve();
        });
        this.triggerEvent('pageRetrievedFromCache');
    } else {
        if (!this.preloadPromise || this.preloadPromise.route != url) {
            var xhrPromise = new Promise(function (resolve) {
                _this.getPage(url, function (response) {
                    if (response === null) {
                        console.warn('Server error.');
                        _this.triggerEvent('serverError');
                        _this.goBack();
                    } else {
                        // get json data
                        var page = _this.getDataFromHtml(response);
                        page.url = url;
                        // render page
                        _this.cache.cacheUrl(page, _this.options.debugMode);
                        _this.triggerEvent('pageLoaded');
                    }
                    resolve();
                });
            });
        } else {
            var xhrPromise = this.preloadPromise;
        }
    }

    Promise.all(animationPromises.concat([xhrPromise])).then(function () {
        finalPage = _this.cache.getPage(url);
        if (!_this.options.cache) {
            _this.cache.empty(_this.options.debugMode);
        }
        _this.renderPage(finalPage, popstate);
        _this.preloadPromise = null;
    });
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (html) {
    var _this = this;

    var content = html.replace('<body', '<div id="swupBody"').replace('</body>', '</div>');
    var fakeDom = document.createElement('div');
    fakeDom.innerHTML = content;
    var blocks = [];

    for (var i = 0; i < this.options.elements.length; i++) {
        if (fakeDom.querySelector(this.options.elements[i]) == null) {
            console.warn('Element ' + this.options.elements[i] + ' is not found cached page.');
        } else {
            [].forEach.call(document.body.querySelectorAll(this.options.elements[i]), function (item, index) {
                fakeDom.querySelectorAll(_this.options.elements[i])[index].dataset.swup = blocks.length;
                blocks.push(fakeDom.querySelectorAll(_this.options.elements[i])[index].outerHTML);
            });
        }
    }

    var json = {
        title: fakeDom.querySelector('title').innerText,
        pageClass: fakeDom.querySelector('#swupBody').className,
        originalContent: html,
        blocks: blocks
    };
    return json;
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (location, callback) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status !== 500) {
                callback(request.responseText, request);
            } else {
                callback(null, request);
            }
        }
    };

    request.open("GET", location, true);
    request.setRequestHeader("X-Requested-With", "swup");
    request.send(null);
    return request;
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function transitionEnd() {
    var el = document.createElement('div');

    var transEndEventNames = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'oTransitionEnd otransitionend',
        transition: 'transitionend'
    };

    for (var name in transEndEventNames) {
        if (el.style[name] !== undefined) {
            return transEndEventNames[name];
        }
    }

    return false;
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = function () {
    function Cache() {
        _classCallCheck(this, Cache);

        this.pages = {};
        this.count = 0;
        this.last = null;
    }

    _createClass(Cache, [{
        key: 'cacheUrl',
        value: function cacheUrl(page, displayCache) {
            this.count++;
            if (page.url in this.pages === false) {
                this.pages[page.url] = page;
            }
            this.last = this.pages[page.url];
            if (displayCache) {
                this.displayCache();
            }
        }
    }, {
        key: 'getPage',
        value: function getPage(url) {
            return this.pages[url];
        }
    }, {
        key: 'displayCache',
        value: function displayCache() {
            console.groupCollapsed('Cache (' + Object.keys(this.pages).length + ')');
            for (var key in this.pages) {
                console.log(this.pages[key]);
            }
            console.groupEnd();
        }
    }, {
        key: 'exists',
        value: function exists(url) {
            if (url in this.pages) return true;
            return false;
        }
    }, {
        key: 'empty',
        value: function empty(showLog) {
            this.pages = {};
            this.count = 0;
            this.last = null;
            if (showLog) {
                console.log('Cache cleared');
            }
        }
    }]);

    return Cache;
}();

exports.default = Cache;

/***/ }),
/* 17 */
/***/ (function(module, exports) {

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
var detectie = function() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
    // other browser
    return false;
}

module.exports = detectie;

/***/ }),
/* 18 */
/***/ (function(module, exports) {

var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var closest = __webpack_require__(18);

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// helpers


// modules


var _delegate = __webpack_require__(19);

var _delegate2 = _interopRequireDefault(_delegate);

var _detectie = __webpack_require__(17);

var _detectie2 = _interopRequireDefault(_detectie);

var _Cache = __webpack_require__(16);

var _Cache2 = _interopRequireDefault(_Cache);

var _Link = __webpack_require__(0);

var _Link2 = _interopRequireDefault(_Link);

var _transitionEnd = __webpack_require__(15);

var _transitionEnd2 = _interopRequireDefault(_transitionEnd);

var _request = __webpack_require__(14);

var _request2 = _interopRequireDefault(_request);

var _getDataFromHtml = __webpack_require__(13);

var _getDataFromHtml2 = _interopRequireDefault(_getDataFromHtml);

var _loadPage = __webpack_require__(12);

var _loadPage2 = _interopRequireDefault(_loadPage);

var _renderPage = __webpack_require__(11);

var _renderPage2 = _interopRequireDefault(_renderPage);

var _goBack = __webpack_require__(10);

var _goBack2 = _interopRequireDefault(_goBack);

var _createState = __webpack_require__(9);

var _createState2 = _interopRequireDefault(_createState);

var _triggerEvent = __webpack_require__(8);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

var _getUrl = __webpack_require__(7);

var _getUrl2 = _interopRequireDefault(_getUrl);

var _scrollTo = __webpack_require__(6);

var _scrollTo2 = _interopRequireDefault(_scrollTo);

var _classify = __webpack_require__(5);

var _classify2 = _interopRequireDefault(_classify);

var _doScrolling = __webpack_require__(4);

var _doScrolling2 = _interopRequireDefault(_doScrolling);

var _markSwupElements = __webpack_require__(3);

var _markSwupElements2 = _interopRequireDefault(_markSwupElements);

var _updateTransition = __webpack_require__(2);

var _updateTransition2 = _interopRequireDefault(_updateTransition);

var _preloadPages = __webpack_require__(1);

var _preloadPages2 = _interopRequireDefault(_preloadPages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Swup = function () {
    function Swup(setOptions) {
        _classCallCheck(this, Swup);

        // default options
        var defaults = {
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

            /**
             * current transition object
             */
        };this.transition = {};

        var options = _extends({}, defaults, setOptions);

        /**
         * helper variables
         */
        // mobile detection variable
        this.mobile = false;
        // id of element to scroll to after render
        this.scrollToElement = null;
        // promise used for preload, so no new loading of the same page starts while page is loading
        this.preloadPromise = null;
        // save options
        this.options = options;

        /**
         * make modules accessible in instance
         */
        this.getUrl = _getUrl2.default;
        this.cache = new _Cache2.default();
        this.link = new _Link2.default();
        this.transitionEndEvent = (0, _transitionEnd2.default)();
        this.getDataFromHtml = _getDataFromHtml2.default;
        this.getPage = _request2.default;
        this.scrollTo = _scrollTo2.default;
        this.loadPage = _loadPage2.default;
        this.renderPage = _renderPage2.default;
        this.goBack = _goBack2.default;
        this.createState = _createState2.default;
        this.triggerEvent = _triggerEvent2.default;
        this.classify = _classify2.default;
        this.doScrolling = _doScrolling2.default;
        this.markSwupElements = _markSwupElements2.default;
        this.updateTransition = _updateTransition2.default;
        this.preloadPages = _preloadPages2.default;
        this.detectie = _detectie2.default;
        this.enable = this.enable;
        this.destroy = this.destroy;

        /**
         * detect mobile devices
         */
        if (window.innerWidth <= 767) {
            this.mobile = true;
        }

        // attach instance to window in debug mode
        if (this.options.debugMode) {
            window.swup = this;
        }

        this.getUrl();
        this.enable();
    }

    _createClass(Swup, [{
        key: 'enable',
        value: function enable() {
            /**
             * support check
             */
            if (this.options.support) {
                // check pushState support
                if (!('pushState' in window.history)) {
                    console.warn('pushState is not supported');
                    return;
                }
                // check transitionEnd support
                if ((0, _transitionEnd2.default)()) {
                    this.transitionEndEvent = (0, _transitionEnd2.default)();
                } else {
                    console.warn('transitionEnd detection is not supported');
                    return;
                }
                // check Promise support
                if (typeof Promise === "undefined" || Promise.toString().indexOf("[native code]") === -1) {
                    console.warn('Promise is not supported');
                    return;
                }
            }
            /**
             * disable IE
             */
            if (this.options.disableIE && this.detectie()) {
                return;
            }

            // variable to keep event listeners from "delegate"
            this.delegatedListeners = {};

            /**
             * link click handler
             */
            this.delegatedListeners.click = (0, _delegate2.default)(document, this.options.LINK_SELECTOR, 'click', this.linkClickHandler.bind(this));

            /**
             * link mouseover handler (preload)
             */
            this.delegatedListeners.mouseover = (0, _delegate2.default)(document.body, this.options.LINK_SELECTOR, 'mouseover', this.linkMouseoverHandler.bind(this));

            /**
             * popstate handler
             */
            window.addEventListener('popstate', this.popStateHandler.bind(this));

            /**
             * initial save to cache
             */
            var page = this.getDataFromHtml(document.documentElement.innerHTML);
            page.url = this.currentUrl;
            if (this.options.cache) {
                this.cache.cacheUrl(page, this.options.debugMode);
            }

            /**
             * mark swup blocks in html
             */
            this.markSwupElements(document.documentElement);

            /**
             * trigger enabled event
             */
            this.triggerEvent('enabled');
            document.documentElement.classList.add('swup-enabled');

            /**
             * trigger page view event
             */
            this.triggerEvent('pageView');

            /**
             * preload pages if possible
             */
            this.preloadPages();
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            // remove delegated listeners
            this.delegatedListeners.click.destroy();
            this.delegatedListeners.mouseover.destroy();

            // remove popstate listener
            window.removeEventListener('popstate', this.popStateHandler.bind(this));

            // empty cache
            this.cache.empty();

            // remove swup data atributes from blocks
            document.querySelectorAll('[data-swup]').forEach(function (element) {
                delete element.dataset.swup;
            });

            this.triggerEvent('disabled');
            document.documentElement.classList.remove('swup-enabled');
        }
    }, {
        key: 'linkClickHandler',
        value: function linkClickHandler(event) {
            // no control key pressed
            if (!event.metaKey) {
                this.triggerEvent('clickLink');
                var link = new _Link2.default();
                event.preventDefault();
                link.setPath(event.delegateTarget.href);
                if (link.getAddress() == this.currentUrl || link.getAddress() == '') {
                    if (link.getHash() != '') {
                        this.triggerEvent('samePageWithHash');
                        var element = document.querySelector(link.getHash());
                        if (element != null) {
                            if (this.options.scroll) {
                                var top = element.getBoundingClientRect().top + window.pageYOffset;
                                this.scrollTo(document.body, top);
                            }
                            history.replaceState(undefined, undefined, link.getHash());
                        } else {
                            console.warn('Element for offset not found (' + link.getHash() + ')');
                        }
                    } else {
                        this.triggerEvent('samePage');
                        if (this.options.scroll) {
                            this.scrollTo(document.body, 0, 1);
                        }
                    }
                } else {
                    if (link.getHash() != '') {
                        this.scrollToElement = link.getHash();
                    }
                    // custom class fro dynamic pages
                    var swupClass = event.delegateTarget.dataset.swupClass;
                    if (swupClass != null) {
                        this.updateTransition(window.location.pathname, link.getAddress(), event.delegateTarget.dataset.swupClass);
                        document.documentElement.classList.add('to-' + swupClass);
                    } else {
                        this.updateTransition(window.location.pathname, link.getAddress());
                    }
                    this.loadPage(link.getAddress(), false);
                }
            } else {
                this.triggerEvent('openPageInNewTab');
            }
        }
    }, {
        key: 'linkMouseoverHandler',
        value: function linkMouseoverHandler(event) {
            var _this = this;

            this.triggerEvent('hoverLink');
            if (this.options.preload) {
                var link = new _Link2.default();
                link.setPath(event.delegateTarget.href);
                if (link.getAddress() != this.currentUrl && !this.cache.exists(link.getAddress()) && this.preloadPromise == null) {
                    this.preloadPromise = new Promise(function (resolve) {
                        _this.getPage(link.getAddress(), function (response) {
                            if (response === null) {
                                console.warn('Server error.');
                                _this.triggerEvent('serverError');
                            } else {
                                // get json data
                                var page = _this.getDataFromHtml(response);
                                page.url = link.getAddress();
                                _this.cache.cacheUrl(page, _this.options.debugMode);
                                _this.triggerEvent('pagePreloaded');
                            }
                            resolve();
                            _this.preloadPromise = null;
                        });
                    });
                    this.preloadPromise.route = link.getAddress();
                }
            }
        }
    }, {
        key: 'popStateHandler',
        value: function popStateHandler(event) {
            var link = new _Link2.default();
            link.setPath(event.state ? event.state.url : window.location.pathname);
            if (link.getHash() != '') {
                this.scrollToElement = link.getHash();
            } else {
                event.preventDefault();
            }
            this.triggerEvent('popState');
            this.loadPage(link.getAddress(), event);
        }
    }]);

    return Swup;
}();

exports.default = Swup;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(20);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _index2.default; // this is here for webpack to expose Swup as window.Swup

/***/ })
/******/ ]);
});