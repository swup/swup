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

// Fill versions to exactly 3 decimals
export const normalizeVersion = (version) => {
	return String(version)
		.split('.')
		.concat([0, 0, 0])
		.slice(0, 3)
		.join('.');
};

// Numerically compare version strings after normalizing them
export const compareVersion = (a, b) => {
	a = normalizeVersion(a);
	b = normalizeVersion(b);
	return a.localeCompare(b, undefined, { numeric: true });
};

// Check if the required version is installed
export const checkVersion = (installed, required) => {
	return compareVersion(installed, required) >= 0;
};
