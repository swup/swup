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

export const nextTick = (callback) => {
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			callback();
		});
	});
};

export const escapeCssIdentifier = (ident) => {
	if (window.CSS && window.CSS.escape) {
		return CSS.escape(ident);
	} else {
		return ident;
	}
};

export const compareArrays = (array1, array2) => {
	return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
};
