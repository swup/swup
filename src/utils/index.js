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

const escapeCssRegex = /(^[^_a-zA-Z\u00a0-\uffff]|[^-_a-zA-Z0-9\u00a0-\uffff])/g;

export const escapeCssIdentifier = (ident) => {
	if (window.CSS && window.CSS.escape) {
		return CSS.escape(ident);
	} else {
		return ident.replace(escapeCssRegex, "\\$1");
	}
};
