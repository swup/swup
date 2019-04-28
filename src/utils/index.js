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
