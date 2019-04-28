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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var query = exports.query = function query(selector) {
	var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	if (typeof selector !== 'string') {
		return selector;
	}

	return context.querySelector(selector);
};

var queryAll = exports.queryAll = function queryAll(selector) {
	var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	if (typeof selector !== 'string') {
		return selector;
	}

	return Array.prototype.slice.call(context.querySelectorAll(selector));
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.markSwupElements = exports.getCurrentUrl = exports.transitionEnd = exports.fetch = exports.getDataFromHTML = exports.createHistoryRecord = exports.classify = undefined;

var _classify = __webpack_require__(9);

var _classify2 = _interopRequireDefault(_classify);

var _createHistoryRecord = __webpack_require__(10);

var _createHistoryRecord2 = _interopRequireDefault(_createHistoryRecord);

var _getDataFromHTML = __webpack_require__(11);

var _getDataFromHTML2 = _interopRequireDefault(_getDataFromHTML);

var _fetch = __webpack_require__(12);

var _fetch2 = _interopRequireDefault(_fetch);

var _transitionEnd = __webpack_require__(13);

var _transitionEnd2 = _interopRequireDefault(_transitionEnd);

var _getCurrentUrl = __webpack_require__(14);

var _getCurrentUrl2 = _interopRequireDefault(_getCurrentUrl);

var _markSwupElements = __webpack_require__(15);

var _markSwupElements2 = _interopRequireDefault(_markSwupElements);

var _Link = __webpack_require__(16);

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var classify = exports.classify = _classify2.default;
var createHistoryRecord = exports.createHistoryRecord = _createHistoryRecord2.default;
var getDataFromHTML = exports.getDataFromHTML = _getDataFromHTML2.default;
var fetch = exports.fetch = _fetch2.default;
var transitionEnd = exports.transitionEnd = _transitionEnd2.default;
var getCurrentUrl = exports.getCurrentUrl = _getCurrentUrl2.default;
var markSwupElements = exports.markSwupElements = _markSwupElements2.default;
var Link = exports.Link = _Link2.default;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _helpers = __webpack_require__(1);

var preloadPage = function preloadPage(pathname) {
	var _this = this;

	var link = new _helpers.Link(pathname);
	return new Promise(function (resolve, reject) {
		if (link.getAddress() != (0, _helpers.getCurrentUrl)() && !_this.cache.exists(link.getAddress())) {
			(0, _helpers.fetch)({ url: link.getAddress() }, function (response, request) {
				if (request.status === 500) {
					_this.triggerEvent('serverError');
					reject();
				} else {
					// get json data
					var page = (0, _helpers.getDataFromHTML)(response, request, _this.options.elements);
					if (page != null) {
						page.url = link.getAddress();
						_this.cache.cacheUrl(page, _this.options.debugMode);
						_this.triggerEvent('pagePreloaded');
					}
					resolve(_this.cache.getPage(link.getAddress()));
				}
			});
		} else {
			resolve(_this.cache.getPage(link.getAddress()));
		}
	});
};

exports.default = preloadPage;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(4);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _index2.default; // this is here for webpack to expose Swup as window.Swup

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// modules


var _delegate = __webpack_require__(5);

var _delegate2 = _interopRequireDefault(_delegate);

var _cache = __webpack_require__(7);

var _cache2 = _interopRequireDefault(_cache);

var _loadPage = __webpack_require__(8);

var _loadPage2 = _interopRequireDefault(_loadPage);

var _renderPage = __webpack_require__(17);

var _renderPage2 = _interopRequireDefault(_renderPage);

var _triggerEvent = __webpack_require__(18);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

var _scrollTo = __webpack_require__(19);

var _scrollTo2 = _interopRequireDefault(_scrollTo);

var _doScrolling = __webpack_require__(20);

var _doScrolling2 = _interopRequireDefault(_doScrolling);

var _on = __webpack_require__(21);

var _on2 = _interopRequireDefault(_on);

var _off = __webpack_require__(22);

var _off2 = _interopRequireDefault(_off);

var _updateTransition = __webpack_require__(23);

var _updateTransition2 = _interopRequireDefault(_updateTransition);

var _preloadPage = __webpack_require__(2);

var _preloadPage2 = _interopRequireDefault(_preloadPage);

var _preloadPages = __webpack_require__(24);

var _preloadPages2 = _interopRequireDefault(_preloadPages);

var _log = __webpack_require__(25);

var _log2 = _interopRequireDefault(_log);

var _utils = __webpack_require__(0);

var _helpers = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Swup = function () {
	function Swup(setOptions) {
		_classCallCheck(this, Swup);

		// default options
		var defaults = {
			cache: true,
			animationSelector: '[class*="transition-"]',
			elements: ['#swup'],
			pageClassPrefix: '',
			debugMode: false,
			scroll: true,

			doScrollingRightAway: false,
			animateScroll: true,
			scrollFriction: 0.3,
			scrollAcceleration: 0.04,

			preload: true,
			support: true,
			plugins: [],

			skipPopStateHandling: function skipPopStateHandling(event) {
				if (event.state && event.state.source == 'swup') {
					return false;
				}
				return true;
			},
			animateHistoryBrowsing: false,

			LINK_SELECTOR: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
			FORM_SELECTOR: 'form[data-swup-form]'
		};

		/**
   * current transition object
   */
		this.transition = {};

		var options = _extends({}, defaults, setOptions);

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
			willReplaceContent: []
		};

		/**
   * helper variables
   */
		// id of element to scroll to after render
		this.scrollToElement = null;
		// promise used for preload, so no new loading of the same page starts while page is loading
		this.preloadPromise = null;
		// save options
		this.options = options;
		// plugins array
		this.plugins = [];

		/**
   * make modules accessible in instance
   */
		this.cache = new _cache2.default();
		this.scrollTo = _scrollTo2.default;
		this.loadPage = _loadPage2.default;
		this.renderPage = _renderPage2.default;
		this.triggerEvent = _triggerEvent2.default;
		this.doScrolling = _doScrolling2.default;
		this.on = _on2.default;
		this.off = _off2.default;
		this.updateTransition = _updateTransition2.default;
		this.preloadPage = _preloadPage2.default;
		this.preloadPages = _preloadPages2.default;
		this.log = _log2.default;
		this.enable = this.enable;
		this.destroy = this.destroy;

		// attach instance to window in debug mode
		if (this.options.debugMode) {
			window.swup = this;
		}

		this.enable();
	}

	_createClass(Swup, [{
		key: 'enable',
		value: function enable() {
			var _this = this;

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
				if (!(0, _helpers.transitionEnd)()) {
					console.warn('transitionEnd detection is not supported');
					return;
				}
				// check Promise support
				if (typeof Promise === 'undefined' || Promise.toString().indexOf('[native code]') === -1) {
					console.warn('Promise is not supported');
					return;
				}
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
    * form submit handler
    */
			this.delegatedListeners.formSubmit = (0, _delegate2.default)(document, this.options.FORM_SELECTOR, 'submit', this.formSubmitHandler.bind(this));

			/**
    * popstate handler
    */
			window.addEventListener('popstate', this.popStateHandler.bind(this));

			/**
    * initial save to cache
    */
			var page = (0, _helpers.getDataFromHTML)(document.documentElement.outerHTML, null, this.options.elements);
			page.url = (0, _helpers.getCurrentUrl)();
			if (this.options.cache) {
				this.cache.cacheUrl(page, this.options.debugMode);
			}

			/**
    * mark swup blocks in html
    */
			(0, _helpers.markSwupElements)(document.documentElement, this.options.elements, this.options.elements);

			/**
    * mount plugins
    */
			this.options.plugins.forEach(function (plugin) {
				if (!plugin.isSwupPlugin) {
					console.warn('Not a swup plugin instance ' + plugin + '.');
					return;
				}

				_this.plugins.push(plugin);
				plugin.mount(options, _this);
			});

			/**
    * modify initial history record
    */
			window.history.replaceState(Object.assign({}, window.history.state, {
				url: window.location.href,
				random: Math.random(),
				source: 'swup'
			}), document.title, window.location.href);

			/**
    * Disable browser scroll control on popstates when animateHistoryBrowsing option is enabled
    */
			if (this.options.animateHistoryBrowsing) {
				window.history.scrollRestoration = 'manual';
			}

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
			var _this2 = this;

			// remove delegated listeners
			this.delegatedListeners.click.destroy();
			this.delegatedListeners.mouseover.destroy();

			// remove popstate listener
			window.removeEventListener('popstate', this.popStateHandler.bind(this));

			// empty cache
			this.cache.empty();

			/**
    * unmount plugins
    */
			this.options.plugins.forEach(function (plugin) {
				plugin.unmount(options, _this2);
			});
			this.plugins = [];

			// remove swup data atributes from blocks
			(0, _utils.queryAll)('[data-swup]').forEach(function (element) {
				delete element.dataset.swup;
			});

			// remove handlers
			this.off();

			this.triggerEvent('disabled');
			document.documentElement.classList.remove('swup-enabled');
		}
	}, {
		key: 'linkClickHandler',
		value: function linkClickHandler(event) {
			// no control key pressed
			if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
				// index of pressed button needs to be checked because Firefox triggers click on all mouse buttons
				if (event.button === 0) {
					this.triggerEvent('clickLink', event);
					event.preventDefault();
					var link = new _helpers.Link(event.delegateTarget);
					if (link.getAddress() == (0, _helpers.getCurrentUrl)() || link.getAddress() == '') {
						// link to the same URL
						if (link.getHash() != '') {
							// link to the same URL with hash
							this.triggerEvent('samePageWithHash', event);
							var element = document.querySelector(link.getHash());
							if (element != null) {
								// referenced element found
								if (this.options.scroll) {
									var top = element.getBoundingClientRect().top + window.pageYOffset;
									this.scrollTo(document.body, top);
								}
								history.replaceState({
									url: link.getAddress() + link.getHash(),
									random: Math.random(),
									source: 'swup'
								}, document.title, link.getAddress() + link.getHash());
							} else {
								// referenced element not found
								console.warn('Element for offset not found (' + link.getHash() + ')');
							}
						} else {
							// link to the same URL without hash
							this.triggerEvent('samePage', event);
							if (this.options.scroll) {
								this.scrollTo(document.body, 0, 1);
							}
						}
					} else {
						// link to different url
						if (link.getHash() != '') {
							this.scrollToElement = link.getHash();
						}

						// get custom transition from data
						var customTransition = event.delegateTarget.dataset.swupTransition;

						// load page
						this.loadPage({ url: link.getAddress(), customTransition: customTransition }, false);
					}
				}
			} else {
				// open in new tab (do nothing)
				this.triggerEvent('openPageInNewTab', event);
			}
		}
	}, {
		key: 'linkMouseoverHandler',
		value: function linkMouseoverHandler(event) {
			var _this3 = this;

			this.triggerEvent('hoverLink', event);
			if (this.options.preload) {
				var link = new _helpers.Link(event.delegateTarget);
				if (link.getAddress() !== (0, _helpers.getCurrentUrl)() && !this.cache.exists(link.getAddress()) && this.preloadPromise == null) {
					this.preloadPromise = new Promise(function (resolve, reject) {
						(0, _helpers.fetch)({ url: link.getAddress() }, function (response, request) {
							if (request.status === 500) {
								_this3.triggerEvent('serverError', event);
								reject(link.getAddress());
								return;
							} else {
								// get json data
								var page = (0, _helpers.getDataFromHTML)(response, request, _this3.options.elements);
								if (page != null) {
									page.url = link.getAddress();
									_this3.cache.cacheUrl(page, _this3.options.debugMode);
									_this3.triggerEvent('pagePreloaded', event);
								} else {
									reject(link.getAddress());
									return;
								}
							}
							resolve();
							_this3.preloadPromise = null;
						});
					});
					this.preloadPromise.route = link.getAddress();
				}
			}
		}
	}, {
		key: 'formSubmitHandler',
		value: function formSubmitHandler(event) {
			// no control key pressed
			if (!event.metaKey) {
				this.triggerEvent('submitForm', event);
				event.preventDefault();
				var form = event.target;
				var formData = new FormData(form);

				var link = new _helpers.Link(form.action);

				if (link.getHash() != '') {
					this.scrollToElement = link.getHash();
				}

				if (form.method.toLowerCase() != 'get') {
					// remove page from cache
					this.cache.remove(link.getAddress());

					// send data
					this.loadPage({
						url: link.getAddress(),
						method: form.method,
						data: formData
					});
				} else {
					// create base url
					var url = link.getAddress() || window.location.href;
					var inputs = (0, _utils.queryAll)('input, select', form);
					if (url.indexOf('?') == -1) {
						url += '?';
					} else {
						url += '&';
					}

					// add form data to url
					inputs.forEach(function (input) {
						if (input.type == 'checkbox' || input.type == 'radio') {
							if (input.checked) {
								url += encodeURIComponent(input.name) + '=' + encodeURIComponent(input.value) + '&';
							}
						} else {
							url += encodeURIComponent(input.name) + '=' + encodeURIComponent(input.value) + '&';
						}
					});

					// remove last "&"
					url = url.slice(0, -1);

					// remove page from cache
					this.cache.remove(url);

					// send data
					this.loadPage({
						url: url
					});
				}
			} else {
				this.triggerEvent('openFormSubmitInNewTab', event);
			}
		}
	}, {
		key: 'popStateHandler',
		value: function popStateHandler(event) {
			if (this.options.skipPopStateHandling(event)) return;
			var link = new _helpers.Link(event.state ? event.state.url : window.location.pathname);
			if (link.getHash() !== '') {
				this.scrollToElement = link.getHash();
			} else {
				event.preventDefault();
			}
			this.triggerEvent('popState', event);
			this.loadPage({ url: link.getAddress() }, event);
		}
	}]);

	return Swup;
}();

exports.default = Swup;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var closest = __webpack_require__(6);

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
/* 6 */
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = exports.Cache = function () {
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
		key: 'getCurrentPage',
		value: function getCurrentPage() {
			return this.getPage(window.location.pathname + window.location.search);
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
			return url in this.pages;
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
	}, {
		key: 'remove',
		value: function remove(url) {
			delete this.pages[url];
		}
	}]);

	return Cache;
}();

exports.default = Cache;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = __webpack_require__(0);

var _helpers = __webpack_require__(1);

var loadPage = function loadPage(data, popstate) {
	var _this = this;

	// scrolling
	if (this.options.doScrollingRightAway && !this.scrollToElement) {
		this.doScrolling(popstate);
	}

	// create array for storing animation promises
	var animationPromises = [];

	// set transition object
	if (data.customTransition != null) {
		this.updateTransition(window.location.pathname, data.url, data.customTransition);
		document.documentElement.classList.add('to-' + (0, _helpers.classify)(data.customTransition));
	} else {
		this.updateTransition(window.location.pathname, data.url);
	}

	if (!popstate || this.options.animateHistoryBrowsing) {
		// start animation
		this.triggerEvent('animationOutStart');
		document.documentElement.classList.add('is-changing');
		document.documentElement.classList.add('is-leaving');
		document.documentElement.classList.add('is-animating');
		if (popstate) {
			document.documentElement.classList.add('is-popstate');
		}
		document.documentElement.classList.add('to-' + (0, _helpers.classify)(data.url));

		// detect animation end
		var animatedElements = (0, _utils.queryAll)(this.options.animationSelector);
		animatedElements.forEach(function (element) {
			var promise = new Promise(function (resolve) {
				element.addEventListener((0, _helpers.transitionEnd)(), function (event) {
					if (element == event.target) {
						resolve();
					}
				});
			});
			animationPromises.push(promise);
		});

		Promise.all(animationPromises).then(function () {
			_this.triggerEvent('animationOutDone');
		});

		// create pop element with or without anchor
		var pop = void 0;
		if (this.scrollToElement != null) {
			pop = data.url + this.scrollToElement;
		} else {
			pop = data.url;
		}
		if (!popstate) (0, _helpers.createHistoryRecord)(pop);
	} else {
		// proceed without animating
		this.triggerEvent('animationSkipped');
	}

	var xhrPromise = void 0;
	if (this.cache.exists(data.url)) {
		xhrPromise = new Promise(function (resolve) {
			resolve();
		});
		this.triggerEvent('pageRetrievedFromCache');
	} else {
		if (!this.preloadPromise || this.preloadPromise.route != data.url) {
			xhrPromise = new Promise(function (resolve, reject) {
				(0, _helpers.fetch)(data, function (response, request) {
					if (request.status === 500) {
						_this.triggerEvent('serverError');
						reject(data.url);
						return;
					} else {
						// get json data
						var page = (0, _helpers.getDataFromHTML)(response, request, _this.options.elements);
						if (page != null) {
							page.url = data.url;
						} else {
							reject(data.url);
							return;
						}
						// render page
						_this.cache.cacheUrl(page, _this.options.debugMode);
						_this.triggerEvent('pageLoaded');
					}
					resolve();
				});
			});
		} else {
			xhrPromise = this.preloadPromise;
		}
	}

	Promise.all(animationPromises.concat([xhrPromise])).then(function () {
		// render page
		_this.renderPage(_this.cache.getPage(data.url), popstate);
		_this.preloadPromise = null;
	}).catch(function (errorUrl) {
		// rewrite the skipPopStateHandling function to redirect manually when the history.go is processed
		_this.options.skipPopStateHandling = function () {
			window.location = errorUrl;
			return true;
		};

		// go back to the actual page were still at
		window.history.go(-1);
	});
};

exports.default = loadPage;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var classify = function classify(text) {
	var output = text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
	.replace(/\//g, '-') // Replace / with -
	.replace(/[^\w\-]+/g, '') // Remove all non-word chars
	.replace(/\-\-+/g, '-') // Replace multiple - with single -
	.replace(/^-+/, '') // Trim - from start of text
	.replace(/-+$/, ''); // Trim - from end of text
	if (output[0] === '/') output = output.splice(1);
	if (output === '') output = 'homepage';
	return output;
};

exports.default = classify;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var createHistoryRecord = function createHistoryRecord(url) {
	window.history.pushState({
		url: url || window.location.href.split(window.location.hostname)[1],
		random: Math.random(),
		source: 'swup'
	}, document.getElementsByTagName('title')[0].innerText, url || window.location.href.split(window.location.hostname)[1]);
};

exports.default = createHistoryRecord;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = __webpack_require__(0);

var getDataFromHTML = function getDataFromHTML(html, request, containers) {
	var content = html.replace('<body', '<div id="swupBody"').replace('</body>', '</div>');
	var fakeDom = document.createElement('div');
	fakeDom.innerHTML = content;
	var blocks = [];

	var _loop = function _loop(i) {
		if (fakeDom.querySelector(containers[i]) == null) {
			console.warn('Element ' + containers[i] + ' is not found in cached page.');
			return {
				v: null
			};
		} else {
			(0, _utils.queryAll)(containers[i]).forEach(function (item, index) {
				(0, _utils.queryAll)(containers[i], fakeDom)[index].dataset.swup = blocks.length;
				blocks.push((0, _utils.queryAll)(containers[i], fakeDom)[index].outerHTML);
			});
		}
	};

	for (var i = 0; i < containers.length; i++) {
		var _ret = _loop(i);

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}

	var json = {
		title: fakeDom.querySelector('title').innerText,
		pageClass: fakeDom.querySelector('#swupBody').className,
		originalContent: html,
		blocks: blocks,
		responseURL: request != null ? request.responseURL : window.location.href
	};
	return json;
};

exports.default = getDataFromHTML;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var fetch = function fetch(options) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	var defaults = {
		url: window.location.pathname + window.location.search,
		method: 'GET',
		data: null
	};

	var data = _extends({}, defaults, options);

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

	request.open(data.method, data.url, true);
	request.setRequestHeader('X-Requested-With', 'swup');
	request.send(data.data);
	return request;
};

exports.default = fetch;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var transitionEnd = function transitionEnd() {
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

exports.default = transitionEnd;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var getCurrentUrl = function getCurrentUrl() {
	return window.location.pathname + window.location.search;
};

exports.default = getCurrentUrl;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = __webpack_require__(0);

var markSwupElements = function markSwupElements(element, containers) {
	var blocks = 0;

	var _loop = function _loop(i) {
		if (element.querySelector(containers[i]) == null) {
			console.warn('Element ' + containers[i] + ' is not in current page.');
		} else {
			(0, _utils.queryAll)(containers[i]).forEach(function (item, index) {
				(0, _utils.queryAll)(containers[i], element)[index].dataset.swup = blocks;
				blocks++;
			});
		}
	};

	for (var i = 0; i < containers.length; i++) {
		_loop(i);
	}
};

exports.default = markSwupElements;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Link = function () {
	function Link(elementOrUrl) {
		_classCallCheck(this, Link);

		if (elementOrUrl instanceof Element || elementOrUrl instanceof SVGElement) {
			this.link = elementOrUrl;
		} else {
			this.link = document.createElement('a');
			this.link.href = elementOrUrl;
		}
	}

	_createClass(Link, [{
		key: 'getPath',
		value: function getPath() {
			var path = this.link.pathname;
			if (path[0] !== '/') {
				path = '/' + path;
			}
			return path;
		}
	}, {
		key: 'getAddress',
		value: function getAddress() {
			var path = this.link.pathname + this.link.search;

			if (this.link.getAttribute('xlink:href')) {
				path = this.link.getAttribute('xlink:href');
			}

			if (path[0] !== '/') {
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = __webpack_require__(0);

var _helpers = __webpack_require__(1);

var renderPage = function renderPage(page, popstate) {
	var _this = this;

	document.documentElement.classList.remove('is-leaving');

	// replace state in case the url was redirected
	var link = new _helpers.Link(page.responseURL);

	if (window.location.pathname !== link.getPath()) {
		window.history.replaceState({
			url: link.getPath(),
			random: Math.random(),
			source: 'swup'
		}, document.title, link.getPath());
	}

	// only add for non-popstate transitions
	if (!popstate || this.options.animateHistoryBrowsing) {
		document.documentElement.classList.add('is-rendering');
	}

	this.triggerEvent('willReplaceContent');

	// replace blocks
	for (var i = 0; i < page.blocks.length; i++) {
		document.body.querySelector('[data-swup="' + i + '"]').outerHTML = page.blocks[i];
	}

	// set title
	document.title = page.title;

	// handle classes after render
	// remove
	if (this.options.pageClassPrefix !== false) {
		document.body.className.split(' ').forEach(function (className) {
			// empty string for page class
			if (className != '' && className.includes(_this.options.pageClassPrefix)) {
				document.body.classList.remove(className);
			}
		});
	}
	// add
	if (page.pageClass != '') {
		page.pageClass.split(' ').forEach(function (className) {
			if (className != '' && className.includes(_this.options.pageClassPrefix)) {
				document.body.classList.add(className);
			}
		});
	}

	this.triggerEvent('contentReplaced');
	this.triggerEvent('pageView');
	if (!this.options.cache) {
		this.cache.empty(this.options.debugMode);
	}
	setTimeout(function () {
		if (!popstate || _this.options.animateHistoryBrowsing) {
			_this.triggerEvent('animationInStart');
			document.documentElement.classList.remove('is-animating');
		}
	}, 10);

	// scrolling
	if (!this.options.doScrollingRightAway || this.scrollToElement) {
		this.doScrolling(popstate);
	}

	// detect animation end
	var animatedElements = (0, _utils.queryAll)(this.options.animationSelector);
	var promises = [];
	animatedElements.forEach(function (element) {
		var promise = new Promise(function (resolve) {
			element.addEventListener((0, _helpers.transitionEnd)(), function (event) {
				if (element == event.target) {
					resolve();
				}
			});
		});
		promises.push(promise);
	});

	//preload pages if possible
	this.preloadPages();

	if (!popstate || this.options.animateHistoryBrowsing) {
		Promise.all(promises).then(function () {
			_this.triggerEvent('animationInDone');
			// remove "to-{page}" classes
			document.documentElement.className.split(' ').forEach(function (classItem) {
				if (new RegExp('^to-').test(classItem) || classItem === 'is-changing' || classItem === 'is-rendering' || classItem === 'is-popstate') {
					document.documentElement.classList.remove(classItem);
				}
			});
		});
	}

	// reset scroll-to element
	this.scrollToElement = null;
};

exports.default = renderPage;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var triggerEvent = function triggerEvent(eventName, originalEvent) {
	if (this.options.debugMode && originalEvent) {
		console.groupCollapsed('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD');
		console.log(originalEvent);
		console.groupEnd();
	} else if (this.options.debugMode) {
		console.log('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD');
	}

	// call saved handlers with "on" method and pass originalEvent object if available
	this._handlers[eventName].forEach(function (handler) {
		try {
			handler(originalEvent);
		} catch (error) {
			console.error(error);
		}
	});

	// trigger event on document with prefix "swup:"
	var event = new CustomEvent('swup:' + eventName, { detail: eventName });
	document.dispatchEvent(event);
};

exports.default = triggerEvent;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var scrollTo = function scrollTo(element, to) {
	var _this = this;

	var animatedScroll = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.options.animateScroll;

	var friction = 1 - this.options.scrollFriction;
	var acceleration = this.options.scrollAcceleration;

	var positionY = 0;
	var velocityY = 0;
	var targetPositionY = 0;
	var targetPositionYWithOffset = 0;
	var direction = 0;

	var raf = null;

	function getScrollTop() {
		return document.body.scrollTop || document.documentElement.scrollTop;
	}

	var animate = function animate() {
		var distance = update();
		render();

		if (direction === 1 && targetPositionY > positionY || direction === -1 && targetPositionY < positionY) {
			raf = requestAnimationFrame(animate);
		} else {
			window.scrollTo(0, targetPositionY);
			_this.triggerEvent('scrollDone');
		}
	};

	function update() {
		var distance = targetPositionYWithOffset - positionY;
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
		direction = positionY > offset ? -1 : 1;
		targetPositionYWithOffset = offset + direction;
		targetPositionY = offset;
		velocityY = 0;
		if (positionY != targetPositionY) {
			animate();
		} else {
			_this.triggerEvent('scrollDone');
		}
	};

	this.triggerEvent('scrollStart');
	if (animatedScroll == 0) {
		window.scrollTo(0, to);
		this.triggerEvent('scrollDone');
	} else {
		scrollTo(to);
	}
};

exports.default = scrollTo;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var doScrolling = function doScrolling(popstate) {
	if (this.options.scroll && (!popstate || this.options.animateHistoryBrowsing)) {
		if (this.scrollToElement != null) {
			var element = document.querySelector(this.scrollToElement);
			if (element != null) {
				var top = element.getBoundingClientRect().top + window.pageYOffset;
				this.scrollTo(document.body, top);
			} else {
				console.warn("Element for offset not found (" + this.scrollToElement + ")");
			}
			this.scrollToElement = null;
		} else {
			this.scrollTo(document.body, 0);
		}
	}
};

exports.default = doScrolling;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var on = function on(event, handler) {
	if (this._handlers[event]) {
		this._handlers[event].push(handler);
	} else {
		console.warn("Unsupported event " + event + ".");
	}
};

exports.default = on;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var off = function off(event, handler) {
	var _this = this;

	if (event != null) {
		if (handler != null) {
			if (this._handlers[event] && this._handlers[event].filter(function (savedHandler) {
				return savedHandler === handler;
			}).length) {
				var toRemove = this._handlers[event].filter(function (savedHandler) {
					return savedHandler === handler;
				})[0];
				var index = this._handlers[event].indexOf(toRemove);
				if (index > -1) {
					this._handlers[event].splice(index, 1);
				}
			} else {
				console.warn("Handler for event '" + event + "' no found.");
			}
		} else {
			this._handlers[event] = [];
		}
	} else {
		Object.keys(this._handlers).forEach(function (keys) {
			_this._handlers[keys] = [];
		});
	}
};

exports.default = off;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var updateTransition = function updateTransition(from, to, custom) {
	// homepage case
	if (from == '/') {
		from = '/homepage';
	}
	if (to == '/') {
		to = '/homepage';
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

exports.default = updateTransition;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.preloadPages = undefined;

var _utils = __webpack_require__(0);

var _preloadPage = __webpack_require__(2);

var _preloadPage2 = _interopRequireDefault(_preloadPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var preloadPages = exports.preloadPages = function preloadPages() {
	var _this = this;

	if (this.options.preload) {
		(0, _utils.queryAll)('[data-swup-preload]').forEach(function (element) {
			_this.preloadPage(element.href);
		});
	}
};

exports.default = preloadPages;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var log = function log(str) {
	if (this.options.debugMode) {
		console.log(str + '%c', 'color: #009ACD');
	}
};

exports.default = log;

/***/ })
/******/ ]);
});