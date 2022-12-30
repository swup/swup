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

	return Array.from(context.querySelectorAll(selector));
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

// Fix for Chrome below v61 formatting CSS floats with comma in some locales
export const toMs = (s) => {
	return Number(s.slice(0, -1).replace(',', '.')) * 1000;
};

export const normalizeVersion = (version) => {
	return String(version).split('.').concat([0, 0, 0]).slice(0, 3).join('.');
};

export const compareVersion = (installed, required) => {
	installed = normalizeVersion(installed);
	required = normalizeVersion(required);
	return required.localeCompare(installed, undefined, { numeric: true });
};
