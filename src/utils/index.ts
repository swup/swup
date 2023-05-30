export const query = (selector: string, context: Document | Element = document) => {
	return context.querySelector<HTMLElement>(selector);
};

export const queryAll = (
	selector: string,
	context: Document | Element = document
): HTMLElement[] => {
	return Array.from(context.querySelectorAll(selector));
};

export const nextTick = (callback: () => void) => {
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			callback();
		});
	});
};

export const escapeCssIdentifier = (ident: string) => {
	// @ts-ignore this is for support check, so it's correct that TS complains
	if (window.CSS && window.CSS.escape) {
		return CSS.escape(ident);
	} else {
		return ident;
	}
};

// Fix for Chrome below v61 formatting CSS floats with comma in some locales
export const toMs = (s: string) => {
	return Number(s.slice(0, -1).replace(',', '.')) * 1000;
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
