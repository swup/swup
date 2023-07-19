export const query = (selector: string, context: Document | Element = document) => {
	return context.querySelector<HTMLElement>(selector);
};

export const queryAll = (
	selector: string,
	context: Document | Element = document
): HTMLElement[] => {
	return Array.from(context.querySelectorAll(selector));
};

export const nextTick = (): Promise<void> => {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				resolve();
			});
		});
	});
};

export function isPromise<T>(obj: any): obj is PromiseLike<T> {
	return (
		!!obj &&
		(typeof obj === 'object' || typeof obj === 'function') &&
		typeof obj.then === 'function'
	);
}

export function runAsPromise(func: Function, args: any[] = [], ctx: any = {}): Promise<any> {
	return new Promise((resolve, reject) => {
		const result = func.apply(ctx, args);
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

export const escapeCssIdentifier = (ident: string) => {
	// @ts-ignore this is for support check, so it's correct that TS complains
	if (window.CSS && window.CSS.escape) {
		return CSS.escape(ident);
	}
	return ident;
};

// Fix for Chrome below v61 formatting CSS floats with comma in some locales
export const toMs = (s: string) => {
	return Number(s.slice(0, -1).replace(',', '.')) * 1000;
};
