(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["swupMergeHeadPlugin"] = factory();
	else
		root["swupMergeHeadPlugin"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    name: 'swupMergeHeadPlugin',
    options: { runScripts: false },
    exec: function exec(options, swup, getHTMLfromCache) {
        document.addEventListener('swup:contentReplaced', function () {
            var currentHead = document.querySelector('head');
            var newHead = getHTMLfromCache().querySelector('head');
            replaceHeadWithoutReplacingExistingTags(currentHead, newHead);
        });

        var replaceHeadWithoutReplacingExistingTags = function replaceHeadWithoutReplacingExistingTags(currentHead, newHead) {
            var oldTags = currentHead.children;
            var newTags = newHead.children;
            var oldTagsToRemove = [];
            var newTagsToRemove = [];

            for (var i = 0; i < oldTags.length; i++) {
                var oldTag = oldTags[i];
                var oldTagIdentifier = oldTag.outerHTML;
                var foundInNewHead = false;
                var newTag = void 0;
                for (var j = 0; j < newTags.length; j++) {
                    newTag = newTags[j];
                    var newTagIdentifier = newTag.outerHTML;

                    if (newTagIdentifier === oldTagIdentifier) {
                        foundInNewHead = true;
                        break;
                    }
                }

                if (foundInNewHead) {
                    newTagsToRemove.push(newTag);
                } else {
                    oldTagsToRemove.push(oldTag);
                }
            }

            for (var _i = 0; _i < newTagsToRemove.length; _i++) {
                newHead.removeChild(newTagsToRemove[_i]);
            }

            for (var _i2 = 0; _i2 < oldTagsToRemove.length; _i2++) {
                currentHead.removeChild(oldTagsToRemove[_i2]);
            }

            var added = newHead.children.length;
            var removed = oldTagsToRemove.length;

            var fragment = document.createDocumentFragment();
            for (var _i3 = 0; _i3 < newHead.children.length; _i3++) {
                fragment.appendChild(newHead.children[_i3]);
            }
            currentHead.appendChild(fragment);

            if (options.runScripts) {
                newHead.querySelectorAll('script').forEach(function (item) {
                    if (item.tagName == "SCRIPT" && (item.type == null || item.type == "" || item.type == "text/javascript")) {
                        var elem = document.createElement('script');
                        if (item.src != null && item.src != "") {
                            elem.src = item.src;
                        } else {
                            var inline = document.createTextNode(item.innerText);
                            elem.appendChild(inline);
                        }
                        if (item.type != null && item.type != "") {
                            elem.type = item.type;
                        }
                        currentHead.appendChild(elem);
                    } else {}
                });
            }

            swup.log('Removed ' + removed + ' / added ' + added + ' tags in head');
        };
    }
};

/***/ })
/******/ ]);
});