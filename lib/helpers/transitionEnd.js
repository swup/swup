'use strict';

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