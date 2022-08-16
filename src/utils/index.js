export const query = (selector, context = document) => {
	if (typeof selector !== 'string') {
		return selector;
	}

	return context.querySelector(selector);
};

export const queryAll = (selector, context = document) => {
	if (typeof selector !== 'string') {
		return selector;
	}

	return Array.prototype.slice.call(context.querySelectorAll(selector));
};

export const escapeCssIdentifier = (ident) => {
	if (window.CSS && window.CSS.escape) {
		return CSS.escape(ident);
	} else {
		return ident;
	}
};

export const whenDomLoaded = (callback) => {
	if (['complete', 'interactive', 'loaded'].includes(document.readyState)) {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', () => callback(), false);
	}
};
