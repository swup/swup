"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require("../utils");

var markSwupElements = function markSwupElements(element, containers) {
	var blocks = 0;

	var _loop = function _loop(i) {
		if (element.querySelector(containers[i]) == null) {
			console.warn("Element " + containers[i] + " is not in current page.");
		} else {
			(0, _utils.queryAll)(containers[i]).forEach(function (item, index) {
				(0, _utils.queryAll)(containers[i], element)[index].setAttribute("data-swup", blocks);
				blocks++;
			});
		}
	};

	for (var i = 0; i < containers.length; i++) {
		_loop(i);
	}
};

exports.default = markSwupElements;