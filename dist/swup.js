(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Swup", [], factory);
	else if(typeof exports === 'object')
		exports["Swup"] = factory();
	else
		root["Swup"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ Swup; }
});

;// CONCATENATED MODULE: ./node_modules/delegate-it/index.js
/** Keeps track of raw listeners added to the base elements to avoid duplication */
const ledger = new WeakMap();
function editLedger(wanted, baseElement, callback, setup) {
    var _a, _b;
    if (!wanted && !ledger.has(baseElement)) {
        return false;
    }
    const elementMap = (_a = ledger.get(baseElement)) !== null && _a !== void 0 ? _a : new WeakMap();
    ledger.set(baseElement, elementMap);
    if (!wanted && !ledger.has(baseElement)) {
        return false;
    }
    const setups = (_b = elementMap.get(callback)) !== null && _b !== void 0 ? _b : new Set();
    elementMap.set(callback, setups);
    const existed = setups.has(setup);
    if (wanted) {
        setups.add(setup);
    }
    else {
        setups.delete(setup);
    }
    return existed && wanted;
}
function isEventTarget(elements) {
    return typeof elements.addEventListener === 'function';
}
function safeClosest(event, selector) {
    let target = event.target;
    if (target instanceof Text) {
        target = target.parentElement;
    }
    if (target instanceof Element && event.currentTarget instanceof Element) {
        // `.closest()` may match ancestors of `currentTarget` but we only need its children
        const closest = target.closest(selector);
        if (closest && event.currentTarget.contains(closest)) {
            return closest;
        }
    }
}
// This type isn't exported as a declaration, so it needs to be duplicated above
function delegate(base, selector, type, callback, options) {
    // Handle Selector-based usage
    if (typeof base === 'string') {
        base = document.querySelectorAll(base);
    }
    // Handle Array-like based usage
    if (!isEventTarget(base)) {
        const subscriptions = Array.prototype.map.call(base, (element) => delegate(element, selector, type, callback, options));
        return {
            destroy() {
                for (const subscription of subscriptions) {
                    subscription.destroy();
                }
            },
        };
    }
    // `document` should never be the base, it's just an easy way to define "global event listeners"
    const baseElement = base instanceof Document ? base.documentElement : base;
    // Handle the regular Element usage
    const capture = Boolean(typeof options === 'object' ? options.capture : options);
    const listenerFn = (event) => {
        const delegateTarget = safeClosest(event, selector);
        if (delegateTarget) {
            event.delegateTarget = delegateTarget;
            callback.call(baseElement, event);
        }
    };
    // Drop unsupported `once` option https://github.com/fregante/delegate-it/pull/28#discussion_r863467939
    if (typeof options === 'object') {
        delete options.once;
    }
    const setup = JSON.stringify({ selector, type, capture });
    const isAlreadyListening = editLedger(true, baseElement, callback, setup);
    const delegateSubscription = {
        destroy() {
            baseElement.removeEventListener(type, listenerFn, options);
            editLedger(false, baseElement, callback, setup);
        },
    };
    if (!isAlreadyListening) {
        baseElement.addEventListener(type, listenerFn, options);
    }
    return delegateSubscription;
}
/* harmony default export */ var delegate_it = (delegate);

;// CONCATENATED MODULE: ./src/helpers/classify.js
const classify = text => {
  let output = text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/\//g, '-') // Replace / with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, ''); // Trim - from end of text

  if (output[0] === '/') output = output.splice(1);
  if (output === '') output = 'homepage';
  return output;
};

/* harmony default export */ var helpers_classify = (classify);
;// CONCATENATED MODULE: ./src/helpers/createHistoryRecord.js
const createHistoryRecord = url => {
  window.history.pushState({
    url: url || window.location.href.split(window.location.hostname)[1],
    random: Math.random(),
    source: 'swup'
  }, document.getElementsByTagName('title')[0].innerText, url || window.location.href.split(window.location.hostname)[1]);
};

/* harmony default export */ var helpers_createHistoryRecord = (createHistoryRecord);
;// CONCATENATED MODULE: ./src/utils/index.js
const query = function (selector) {
  let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (typeof selector !== 'string') {
    return selector;
  }

  return context.querySelector(selector);
};
const queryAll = function (selector) {
  let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (typeof selector !== 'string') {
    return selector;
  }

  return Array.prototype.slice.call(context.querySelectorAll(selector));
};
const escapeCssIdentifier = ident => {
  if (window.CSS && window.CSS.escape) {
    return CSS.escape(ident);
  } else {
    return ident;
  }
};
;// CONCATENATED MODULE: ./src/helpers/getDataFromHtml.js


const getDataFromHtml = (html, containers) => {
  let fakeDom = document.createElement('html');
  fakeDom.innerHTML = html;
  let blocks = [];
  containers.forEach(selector => {
    if (query(selector, fakeDom) == null) {
      console.warn("[swup] Container ".concat(selector, " not found on page."));
      return null;
    } else {
      if (queryAll(selector).length !== queryAll(selector, fakeDom).length) {
        console.warn("[swup] Mismatched number of containers found on new page.");
      }

      queryAll(selector).forEach((item, index) => {
        queryAll(selector, fakeDom)[index].setAttribute('data-swup', blocks.length);
        blocks.push(queryAll(selector, fakeDom)[index].outerHTML);
      });
    }
  });
  const json = {
    title: fakeDom.querySelector('title').innerText,
    pageClass: fakeDom.querySelector('body').className,
    originalContent: html,
    blocks: blocks
  }; // to prevent memory leaks

  fakeDom.innerHTML = '';
  fakeDom = null;
  return json;
};

/* harmony default export */ var helpers_getDataFromHtml = (getDataFromHtml);
;// CONCATENATED MODULE: ./src/helpers/fetch.js
const fetch = function (setOptions) {
  let callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  let defaults = {
    url: window.location.pathname + window.location.search,
    method: 'GET',
    data: null,
    headers: {}
  };
  let options = { ...defaults,
    ...setOptions
  };
  let request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status !== 500) {
        callback(request);
      } else {
        callback(request);
      }
    }
  };

  request.open(options.method, options.url, true);
  Object.keys(options.headers).forEach(key => {
    request.setRequestHeader(key, options.headers[key]);
  });
  request.send(options.data);
  return request;
};

/* harmony default export */ var helpers_fetch = (fetch);
;// CONCATENATED MODULE: ./src/helpers/transitionEnd.js
const transitionEnd = () => {
  if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
    return 'webkitTransitionEnd';
  } else {
    return 'transitionend';
  }
};

/* harmony default export */ var helpers_transitionEnd = (transitionEnd);
;// CONCATENATED MODULE: ./src/helpers/transitionProperty.js
const transitionProperty = () => {
  if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
    return 'WebkitTransition';
  } else {
    return 'transition';
  }
};

/* harmony default export */ var helpers_transitionProperty = (transitionProperty);
;// CONCATENATED MODULE: ./src/helpers/getCurrentUrl.js
const getCurrentUrl = () => {
  return window.location.pathname + window.location.search;
};

/* harmony default export */ var helpers_getCurrentUrl = (getCurrentUrl);
;// CONCATENATED MODULE: ./src/helpers/Link.js
class Link {
  constructor(elementOrUrl) {
    if (elementOrUrl instanceof Element || elementOrUrl instanceof SVGElement) {
      this.link = elementOrUrl;
    } else {
      this.link = document.createElement('a');
      this.link.href = elementOrUrl;
    }
  }

  getPath() {
    let path = this.link.pathname;

    if (path[0] !== '/') {
      path = '/' + path;
    }

    return path;
  }

  getAddress() {
    let path = this.link.pathname + this.link.search;

    if (this.link.getAttribute('xlink:href')) {
      path = this.link.getAttribute('xlink:href');
    }

    if (path[0] !== '/') {
      path = '/' + path;
    }

    return path;
  }

  getHash() {
    return this.link.hash;
  }

}
;// CONCATENATED MODULE: ./src/helpers/normalizeUrl.js


const normalizeUrl = url => {
  return new Link(url).getAddress();
};

/* harmony default export */ var helpers_normalizeUrl = (normalizeUrl);
;// CONCATENATED MODULE: ./src/helpers/markSwupElements.js


const markSwupElements = (element, containers) => {
  let blocks = 0;
  containers.forEach(selector => {
    if (query(selector, element) == null) {
      console.warn("[swup] Container ".concat(selector, " not found on page."));
    } else {
      queryAll(selector).forEach((item, index) => {
        queryAll(selector, element)[index].setAttribute('data-swup', blocks);
        blocks++;
      });
    }
  });
};

/* harmony default export */ var helpers_markSwupElements = (markSwupElements);
;// CONCATENATED MODULE: ./src/helpers/cleanupAnimationClasses.js
const cleanupAnimationClasses = () => {
  document.documentElement.className.split(' ').forEach(classItem => {
    if ( // remove "to-{page}" classes
    new RegExp('^to-').test(classItem) || // remove all other classes
    classItem === 'is-changing' || classItem === 'is-rendering' || classItem === 'is-popstate') {
      document.documentElement.classList.remove(classItem);
    }
  });
};

/* harmony default export */ var helpers_cleanupAnimationClasses = (cleanupAnimationClasses);
;// CONCATENATED MODULE: ./src/helpers/index.js











const src_helpers_classify = helpers_classify;
const src_helpers_createHistoryRecord = helpers_createHistoryRecord;
const src_helpers_getDataFromHtml = helpers_getDataFromHtml;
const src_helpers_fetch = helpers_fetch;
const src_helpers_transitionEnd = helpers_transitionEnd;
const src_helpers_transitionProperty = helpers_transitionProperty;
const src_helpers_getCurrentUrl = helpers_getCurrentUrl;
const src_helpers_normalizeUrl = helpers_normalizeUrl;
const src_helpers_markSwupElements = helpers_markSwupElements;
const helpers_Link = Link;
const src_helpers_cleanupAnimationClasses = helpers_cleanupAnimationClasses;
;// CONCATENATED MODULE: ./src/modules/Cache.js

class Cache {
  constructor() {
    this.pages = {};
    this.last = null;
  }

  cacheUrl(page) {
    page.url = src_helpers_normalizeUrl(page.url);

    if (page.url in this.pages === false) {
      this.pages[page.url] = page;
    }

    this.last = this.pages[page.url];
    this.swup.log("Cache (".concat(Object.keys(this.pages).length, ")"), this.pages);
  }

  getPage(url) {
    url = src_helpers_normalizeUrl(url);
    return this.pages[url];
  }

  getCurrentPage() {
    return this.getPage(src_helpers_getCurrentUrl());
  }

  exists(url) {
    url = src_helpers_normalizeUrl(url);
    return url in this.pages;
  }

  empty() {
    this.pages = {};
    this.last = null;
    this.swup.log('Cache cleared');
  }

  remove(url) {
    delete this.pages[url];
  }

}
/* harmony default export */ var modules_Cache = (Cache);
;// CONCATENATED MODULE: ./src/modules/loadPage.js


const loadPage = function (data, popstate) {
  // create array for storing animation promises
  let animationPromises = [],
      xhrPromise;

  const animateOut = () => {
    this.triggerEvent('animationOutStart'); // handle classes

    document.documentElement.classList.add('is-changing');
    document.documentElement.classList.add('is-leaving');
    document.documentElement.classList.add('is-animating');

    if (popstate) {
      document.documentElement.classList.add('is-popstate');
    }

    document.documentElement.classList.add('to-' + src_helpers_classify(data.url)); // animation promise stuff

    animationPromises = this.getAnimationPromises('out');
    Promise.all(animationPromises).then(() => {
      this.triggerEvent('animationOutDone');
    }); // create history record if this is not a popstate call

    if (!popstate) {
      // create pop element with or without anchor
      let state;

      if (this.scrollToElement != null) {
        state = data.url + this.scrollToElement;
      } else {
        state = data.url;
      }

      src_helpers_createHistoryRecord(state);
    }
  };

  this.triggerEvent('transitionStart', popstate); // set transition object

  if (data.customTransition != null) {
    this.updateTransition(window.location.pathname, data.url, data.customTransition);
    document.documentElement.classList.add("to-".concat(src_helpers_classify(data.customTransition)));
  } else {
    this.updateTransition(window.location.pathname, data.url);
  } // start/skip animation


  if (!popstate || this.options.animateHistoryBrowsing) {
    animateOut();
  } else {
    this.triggerEvent('animationSkipped');
  } // start/skip loading of page


  if (this.cache.exists(data.url)) {
    xhrPromise = new Promise(resolve => {
      resolve();
    });
    this.triggerEvent('pageRetrievedFromCache');
  } else {
    if (!this.preloadPromise || this.preloadPromise.route != data.url) {
      xhrPromise = new Promise((resolve, reject) => {
        src_helpers_fetch({ ...data,
          headers: this.options.requestHeaders
        }, response => {
          if (response.status === 500) {
            this.triggerEvent('serverError');
            reject(data.url);
            return;
          } else {
            // get json data
            let page = this.getPageData(response);

            if (page != null && page.blocks.length > 0) {
              page.url = data.url;
            } else {
              reject(data.url);
              return;
            } // render page


            this.cache.cacheUrl(page);
            this.triggerEvent('pageLoaded');
          }

          resolve();
        });
      });
    } else {
      xhrPromise = this.preloadPromise;
    }
  } // when everything is ready, handle the outcome


  Promise.all(animationPromises.concat([xhrPromise])).then(() => {
    // render page
    this.renderPage(this.cache.getPage(data.url), popstate);
    this.preloadPromise = null;
  }).catch(errorUrl => {
    // rewrite the skipPopStateHandling function to redirect manually when the history.go is processed
    this.options.skipPopStateHandling = function () {
      window.location = errorUrl;
      return true;
    }; // go back to the actual page were still at


    window.history.go(-1);
  });
};

/* harmony default export */ var modules_loadPage = (loadPage);
;// CONCATENATED MODULE: ./src/modules/renderPage.js


const renderPage = function (page, popstate) {
  document.documentElement.classList.remove('is-leaving');
  const isCurrentPage = this.getCurrentUrl() === page.url;
  if (!isCurrentPage) return; // replace state in case the url was redirected

  const url = new helpers_Link(page.responseURL).getPath();

  if (window.location.pathname !== url) {
    window.history.replaceState({
      url,
      random: Math.random(),
      source: 'swup'
    }, document.title, url); // save new record for redirected url

    this.cache.cacheUrl({ ...page,
      url
    });
  } // only add for non-popstate transitions


  if (!popstate || this.options.animateHistoryBrowsing) {
    document.documentElement.classList.add('is-rendering');
  }

  this.triggerEvent('willReplaceContent', popstate); // replace blocks

  for (let i = 0; i < page.blocks.length; i++) {
    document.body.querySelector("[data-swup=\"".concat(i, "\"]")).outerHTML = page.blocks[i];
  } // set title


  document.title = page.title;
  this.triggerEvent('contentReplaced', popstate);
  this.triggerEvent('pageView', popstate); // empty cache if it's disabled (because pages could be preloaded and stuff)

  if (!this.options.cache) {
    this.cache.empty();
  } // start animation IN


  setTimeout(() => {
    if (!popstate || this.options.animateHistoryBrowsing) {
      this.triggerEvent('animationInStart');
      document.documentElement.classList.remove('is-animating');
    }
  }, 10); // handle end of animation

  if (!popstate || this.options.animateHistoryBrowsing) {
    const animationPromises = this.getAnimationPromises('in');
    Promise.all(animationPromises).then(() => {
      this.triggerEvent('animationInDone');
      this.triggerEvent('transitionEnd', popstate);
      this.cleanupAnimationClasses();
    });
  } else {
    this.triggerEvent('transitionEnd', popstate);
  } // reset scroll-to element


  this.scrollToElement = null;
};

/* harmony default export */ var modules_renderPage = (renderPage);
;// CONCATENATED MODULE: ./src/modules/triggerEvent.js
const triggerEvent = function (eventName, originalEvent) {
  // call saved handlers with "on" method and pass originalEvent object if available
  this._handlers[eventName].forEach(handler => {
    try {
      handler(originalEvent);
    } catch (error) {
      console.error(error);
    }
  }); // trigger event on document with prefix "swup:"


  const event = new CustomEvent('swup:' + eventName, {
    detail: eventName
  });
  document.dispatchEvent(event);
};

/* harmony default export */ var modules_triggerEvent = (triggerEvent);
;// CONCATENATED MODULE: ./src/modules/on.js
const on = function on(event, handler) {
  if (this._handlers[event]) {
    this._handlers[event].push(handler);
  } else {
    console.warn("Unsupported event ".concat(event, "."));
  }
};

/* harmony default export */ var modules_on = (on);
;// CONCATENATED MODULE: ./src/modules/off.js
const off = function off(event, handler) {
  if (event != null) {
    if (handler != null) {
      if (this._handlers[event] && this._handlers[event].filter(savedHandler => savedHandler === handler).length) {
        let toRemove = this._handlers[event].filter(savedHandler => savedHandler === handler)[0];

        let index = this._handlers[event].indexOf(toRemove);

        if (index > -1) {
          this._handlers[event].splice(index, 1);
        }
      } else {
        console.warn("Handler for event '".concat(event, "' no found."));
      }
    } else {
      this._handlers[event] = [];
    }
  } else {
    Object.keys(this._handlers).forEach(keys => {
      this._handlers[keys] = [];
    });
  }
};

/* harmony default export */ var modules_off = (off);
;// CONCATENATED MODULE: ./src/modules/updateTransition.js
const updateTransition = function (from, to, custom) {
  // transition routes
  this.transition = {
    from: from,
    to: to,
    custom: custom
  };
};

/* harmony default export */ var modules_updateTransition = (updateTransition);
;// CONCATENATED MODULE: ./src/modules/getAnchorElement.js


const getAnchorElement = hash => {
  if (!hash) {
    return null;
  }

  if (hash.charAt(0) === '#') {
    hash = hash.substring(1);
  }

  hash = decodeURIComponent(hash);
  hash = escapeCssIdentifier(hash); // https://html.spec.whatwg.org/#find-a-potential-indicated-element

  return query("#".concat(hash)) || query("a[name='".concat(hash, "']"));
};

/* harmony default export */ var modules_getAnchorElement = (getAnchorElement);
;// CONCATENATED MODULE: ./src/modules/getAnimationPromises.js



const getAnimationPromises = function () {
  const selector = this.options.animationSelector;
  const durationProperty = "".concat(src_helpers_transitionProperty(), "Duration");
  const promises = [];
  const animatedElements = queryAll(selector, document.body);

  if (!animatedElements.length) {
    console.warn("[swup] No animated elements found by selector ".concat(selector));
    return [Promise.resolve()];
  }

  animatedElements.forEach(element => {
    const transitionDuration = window.getComputedStyle(element)[durationProperty]; // Resolve immediately if no transition defined

    if (!transitionDuration || transitionDuration == '0s') {
      console.warn("[swup] No CSS transition duration defined for element of selector ".concat(selector));
      promises.push(Promise.resolve());
      return;
    }

    const promise = new Promise(resolve => {
      element.addEventListener(src_helpers_transitionEnd(), event => {
        if (element == event.target) {
          resolve();
        }
      });
    });
    promises.push(promise);
  });
  return promises;
};

/* harmony default export */ var modules_getAnimationPromises = (getAnimationPromises);
;// CONCATENATED MODULE: ./src/modules/getPageData.js


const getPageData = function (request) {
  // this method can be replaced in case other content than html is expected to be received from server
  // this function should always return {title, pageClass, originalContent, blocks, responseURL}
  // in case page has invalid structure - return null
  const html = request.responseText;
  let pageObject = src_helpers_getDataFromHtml(html, this.options.containers);

  if (pageObject) {
    pageObject.responseURL = request.responseURL ? request.responseURL : window.location.href;
  } else {
    console.warn('[swup] Received page is invalid.');
    return null;
  }

  return pageObject;
};

/* harmony default export */ var modules_getPageData = (getPageData);
;// CONCATENATED MODULE: ./src/modules/plugins.js
const use = function (plugin) {
  if (!plugin.isSwupPlugin) {
    console.warn("Not swup plugin instance ".concat(plugin, "."));
    return;
  }

  this.plugins.push(plugin);
  plugin.swup = this;

  if (typeof plugin._beforeMount === 'function') {
    plugin._beforeMount();
  }

  plugin.mount();
  return this.plugins;
};
const unuse = function (plugin) {
  let pluginReference;

  if (typeof plugin === 'string') {
    pluginReference = this.plugins.find(p => plugin === p.name);
  } else {
    pluginReference = plugin;
  }

  if (!pluginReference) {
    console.warn('No such plugin.');
    return;
  }

  pluginReference.unmount();

  if (typeof pluginReference._afterUnmount === 'function') {
    pluginReference._afterUnmount();
  }

  const index = this.plugins.indexOf(pluginReference);
  this.plugins.splice(index, 1);
  return this.plugins;
};
const findPlugin = function (pluginName) {
  return this.plugins.find(p => pluginName === p.name);
};
;// CONCATENATED MODULE: ./src/index.js
 // modules














class Swup {
  constructor(setOptions) {
    // default options
    let defaults = {
      animateHistoryBrowsing: false,
      animationSelector: '[class*="transition-"]',
      linkSelector: "a[href^=\"".concat(window.location.origin, "\"]:not([data-no-swup]), a[href^=\"/\"]:not([data-no-swup]), a[href^=\"#\"]:not([data-no-swup])"),
      cache: true,
      containers: ['#swup'],
      requestHeaders: {
        'X-Requested-With': 'swup',
        Accept: 'text/html, application/xhtml+xml'
      },
      plugins: [],
      skipPopStateHandling: function (event) {
        return !(event.state && event.state.source === 'swup');
      }
    }; // merge options

    const options = { ...defaults,
      ...setOptions
    }; // handler arrays

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
      openPageInNewTab: [],
      pageLoaded: [],
      pageRetrievedFromCache: [],
      pageView: [],
      popState: [],
      samePage: [],
      samePageWithHash: [],
      serverError: [],
      transitionStart: [],
      transitionEnd: [],
      willReplaceContent: []
    }; // variable for anchor to scroll to after render

    this.scrollToElement = null; // variable for promise used for preload, so no new loading of the same page starts while page is loading

    this.preloadPromise = null; // variable for save options

    this.options = options; // variable for plugins array

    this.plugins = []; // variable for current transition object

    this.transition = {}; // variable for keeping event listeners from "delegate"

    this.delegatedListeners = {}; // so we are able to remove the listener

    this.boundPopStateHandler = this.popStateHandler.bind(this); // make modules accessible in instance

    this.cache = new modules_Cache();
    this.cache.swup = this;
    this.loadPage = modules_loadPage;
    this.renderPage = modules_renderPage;
    this.triggerEvent = modules_triggerEvent;
    this.on = modules_on;
    this.off = modules_off;
    this.updateTransition = modules_updateTransition;
    this.getAnimationPromises = modules_getAnimationPromises;
    this.getPageData = modules_getPageData;
    this.getAnchorElement = modules_getAnchorElement;

    this.log = () => {}; // here so it can be used by plugins


    this.use = use;
    this.unuse = unuse;
    this.findPlugin = findPlugin;
    this.getCurrentUrl = src_helpers_getCurrentUrl;
    this.cleanupAnimationClasses = src_helpers_cleanupAnimationClasses; // enable swup

    this.enable();
  }

  enable() {
    // check for Promise support
    if (typeof Promise === 'undefined') {
      console.warn('Promise is not supported');
      return;
    } // add event listeners


    this.delegatedListeners.click = delegate_it(document, this.options.linkSelector, 'click', this.linkClickHandler.bind(this));
    window.addEventListener('popstate', this.boundPopStateHandler); // initial save to cache

    if (this.options.cache) {
      const page = src_helpers_getDataFromHtml(document.documentElement.outerHTML, this.options.containers);
      page.url = page.responseURL = src_helpers_getCurrentUrl();
      this.cache.cacheUrl(page);
    } // mark swup blocks in html


    src_helpers_markSwupElements(document.documentElement, this.options.containers); // mount plugins

    this.options.plugins.forEach(plugin => {
      this.use(plugin);
    }); // modify initial history record

    window.history.replaceState(Object.assign({}, window.history.state, {
      url: window.location.href,
      random: Math.random(),
      source: 'swup'
    }), document.title, window.location.href); // trigger enabled event

    this.triggerEvent('enabled'); // add swup-enabled class to html tag

    document.documentElement.classList.add('swup-enabled'); // trigger page view event

    this.triggerEvent('pageView');
  }

  destroy() {
    // remove delegated listeners
    this.delegatedListeners.click.destroy(); // remove popstate listener

    window.removeEventListener('popstate', this.boundPopStateHandler); // empty cache

    this.cache.empty(); // unmount plugins

    this.options.plugins.forEach(plugin => {
      this.unuse(plugin);
    }); // remove swup data atributes from blocks

    queryAll('[data-swup]').forEach(element => {
      element.removeAttribute('data-swup');
    }); // remove handlers

    this.off(); // trigger disable event

    this.triggerEvent('disabled'); // remove swup-enabled class from html tag

    document.documentElement.classList.remove('swup-enabled');
  }

  linkClickHandler(event) {
    // no control key pressed
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      // index of pressed button needs to be checked because Firefox triggers click on all mouse buttons
      if (event.button === 0) {
        this.triggerEvent('clickLink', event);
        event.preventDefault();
        const link = new helpers_Link(event.delegateTarget);

        if (link.getAddress() == src_helpers_getCurrentUrl() || link.getAddress() == '') {
          // link to the same URL
          if (link.getHash() != '') {
            // link to the same URL with hash
            this.triggerEvent('samePageWithHash', event);
            const element = modules_getAnchorElement(link.getHash());

            if (element != null) {
              history.replaceState({
                url: link.getAddress() + link.getHash(),
                random: Math.random(),
                source: 'swup'
              }, document.title, link.getAddress() + link.getHash());
            } else {
              // referenced element not found
              console.warn("Element for offset not found (".concat(link.getHash(), ")"));
            }
          } else {
            // link to the same URL without hash
            this.triggerEvent('samePage', event);
          }
        } else {
          // link to different url
          if (link.getHash() != '') {
            this.scrollToElement = link.getHash();
          } // get custom transition from data


          let customTransition = event.delegateTarget.getAttribute('data-swup-transition'); // load page

          this.loadPage({
            url: link.getAddress(),
            customTransition: customTransition
          }, false);
        }
      }
    } else {
      // open in new tab (do nothing)
      this.triggerEvent('openPageInNewTab', event);
    }
  }

  popStateHandler(event) {
    if (this.options.skipPopStateHandling(event)) return;
    const link = new helpers_Link(event.state ? event.state.url : window.location.pathname);

    if (link.getHash() !== '') {
      this.scrollToElement = link.getHash();
    } else {
      event.preventDefault();
    }

    this.triggerEvent('popState', event);

    if (!this.options.animateHistoryBrowsing) {
      document.documentElement.classList.remove('is-animating');
      src_helpers_cleanupAnimationClasses();
    }

    this.loadPage({
      url: link.getAddress()
    }, event);
  }

}
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});