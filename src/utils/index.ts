/** Find an element by selector. */
export const query = (selector: string, context: Document | Element = document) => {
	return context.querySelector<HTMLElement>(selector);
};

/** Find a set of elements by selector. */
export const queryAll = (
	selector: string,
	context: Document | Element = document
): HTMLElement[] => {
	return Array.from(context.querySelectorAll(selector));
};

/** Return a Promise that resolves after the next event loop. */
export const nextTick = (): Promise<void> => {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				resolve();
			});
		});
	});
};

/** Check if an object is a Promise or a Thenable */
export function isPromise<T>(obj: unknown): obj is PromiseLike<T> {
	return (
		!!obj &&
		(typeof obj === 'object' || typeof obj === 'function') &&
		typeof (obj as Record<string, unknown>).then === 'function'
	);
}

/** Call a function as a Promise. Resolves with the returned Promsise or immediately. */
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function runAsPromise(func: Function, args: unknown[] = []): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const result: unknown = func(...args);
		if (isPromise(result)) {
			result.then(resolve, reject);
		} else {
			resolve(result);
		}
	});
}

/**
 * Force a layout reflow, e.g. after adding classnames
 * @returns The offset height, just here so it doesn't get optimized away by the JS engine
 * @see https://stackoverflow.com/a/21665117/3759615
 */
export function forceReflow(element?: HTMLElement) {
	element = element || document.body;
	return element?.offsetHeight;
}

/** Escape a string with special chars to not break CSS selectors. */
export const escapeCssIdentifier = (ident: string) => {
	// @ts-ignore this is for support check, so it's correct that TS complains
	if (window.CSS && window.CSS.escape) {
		return CSS.escape(ident);
	}
	return ident;
};

/** Fix for Chrome below v61 formatting CSS floats with comma in some locales. */
export const toMs = (s: string) => {
	return Number(s.slice(0, -1).replace(',', '.')) * 1000;
};
