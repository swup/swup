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
 * @see https://stackoverflow.com/a/21665117/3759615
 */
export function forceReflow(element?: HTMLElement): void {
	element = element || document.body;
	element?.getBoundingClientRect();
}

/**
 * Read data attribute from closest element with that attribute.
 *
 * Returns `undefined` if no element is found or attribute is missing.
 * Returns `true` if attribute is present without a value.
 */
export function getContextualAttr(
	el: Element | undefined,
	attr: string
): string | boolean | undefined {
	const target = el?.closest(`[${attr}]`);
	return target?.hasAttribute(attr) ? target?.getAttribute(attr) || true : undefined;
}
